import { DatabaseService, uploadImageToSupabase } from '@/lib/dataBase/databaseService';
import { Product, ProductIngredientDetail, ProductDetailProduct } from '@/types';

const productService = new DatabaseService<Product>('products');
const ingredientService = new DatabaseService<ProductIngredientDetail>('product_ingredient_details');
const detailProductService = new DatabaseService<ProductDetailProduct>('product_detail_products');

// ========================================================
// PRODUCT SERVICES
// ========================================================

export async function getProducts(): Promise<Product[]> {
  const [allProducts, allIngredients, allDetails] = await Promise.all([
    productService.getAll('id', true),
    ingredientService.getAll('id', true),
    detailProductService.getAll('id', true)
  ]);

  return allProducts.map(product => ({
    ...product,
    productIngredientDetail: allIngredients.filter(i => i.productId === product.id),
    productDetailProduct: allDetails.filter(d => d.productId === product.id)
  }));
}

export async function getProductById(id: number): Promise<Product | null> {
  const product = await productService.getByField('id', id);
  if (!product) return null;

  const [ingredients, details] = await Promise.all([
    ingredientService.getAll('id', true).then(list => list.filter(i => i.productId === id)),
    detailProductService.getAll('id', true).then(list => list.filter(d => d.productId === id))
  ]);

  return {
    ...product,
    productIngredientDetail: ingredients,
    productDetailProduct: details
  };
}

export async function getProductsByCategory(categoryId: number): Promise<Product[]> {
  const allProducts = await productService.getAll('id', true);
  const filteredProducts = allProducts.filter(p => p.categoryId === categoryId);

  if (filteredProducts.length === 0) return [];

  const [allIngredients, allDetails] = await Promise.all([
    ingredientService.getAll('id', true),
    detailProductService.getAll('id', true)
  ]);

  return filteredProducts.map(product => ({
    ...product,
    productIngredientDetail: allIngredients.filter(i => i.productId === product.id),
    productDetailProduct: allDetails.filter(d => d.productId === product.id)
  }));
}

export async function createProduct(product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>, imageBase64?: string): Promise<Product> {
  try{
let imageUrl = product.imageUrl || '';

  if (imageBase64) {
    try {
      imageUrl = await uploadImageToSupabase(imageBase64, 'products');
    } catch (error) {
      console.error('Error subiendo imagen:', error);
      throw new Error('No se pudo guardar la imagen');
    }
  }

  const { productIngredientDetail, productDetailProduct, ...mainProduct } = product;

  const newProduct = await productService.create({ ...mainProduct, imageUrl });

  let insertedIngredients: ProductIngredientDetail[] = [];
  let insertedDetails: ProductDetailProduct[] = [];

  if (productIngredientDetail && productIngredientDetail.length > 0) {
    for (const ingredient of productIngredientDetail) {
      const savedIngredient = await ingredientService.create({
        ...ingredient,
        productId: newProduct.id
      });
      insertedIngredients.push(savedIngredient);
    }
  }

  if (productDetailProduct && productDetailProduct.length > 0) {
    for (const detail of productDetailProduct) {
      const savedDetail = await detailProductService.create({
        ...detail,
        productId: newProduct.id
      });
      insertedDetails.push(savedDetail);
    }
  }

  return {
    ...newProduct,
    productIngredientDetail: insertedIngredients,
    productDetailProduct: insertedDetails
  };
  }catch(exception){
    console.error('Error creando producto:', exception);
    throw new Error('No se pudo crear el producto');
  }
}

export async function updateProduct(
  id: number,
  updates: Partial<Omit<Product, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<Product | null> {
  return productService.update('id', id, updates);
}

export async function deleteProduct(id: number): Promise<boolean> {
  const currentIngredients = await ingredientService.getAll('id', true).then(list => list.filter(i => i.productId === id));
  const currentDetails = await detailProductService.getAll('id', true).then(list => list.filter(d => d.productId === id));

  await Promise.all([
    ...currentIngredients.map(i => ingredientService.delete('id', i.id)),
    ...currentDetails.map(d => detailProductService.delete('id', d.id))
  ]);
  return productService.delete('id', id);
}

// ========================================================
// FEATURED PRODUCTS ORDER SERVICE
// ========================================================
export async function updateFeaturedProductsOrder(reorderedFeaturedProducts: Product[]): Promise<void> {
  const allProducts = await productService.getAll('id', true);

  // Mapeamos y actualizamos uno por uno en la base de datos aplicando la nueva lógica de ordenamiento
  const updatePromises = allProducts.map(async (product) => {
    const matchedIdx = reorderedFeaturedProducts.findIndex(p => p.id === product.id);

    if (matchedIdx !== -1) {
      return productService.update('id', product.id, {
        isFeatured: true,
        displayOrder: reorderedFeaturedProducts[matchedIdx].displayOrder || (matchedIdx + 1)
      });
    } else {
      return productService.update('id', product.id, {
        isFeatured: false,
        displayOrder: 0
      });
    }
  });

  await Promise.all(updatePromises);
}
