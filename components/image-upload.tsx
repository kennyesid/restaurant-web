'use client';

import React, { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ImageUploadProps {
  value?: string;
  onChange: (base64: string) => void;
  disabled?: boolean;
  maxSize?: number; // in MB
}

export function ImageUpload({ value, onChange, disabled = false, maxSize = 5 }: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(value || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Por favor selecciona un archivo de imagen válido');
      return;
    }

    // Validate file size
    const sizeInMB = file.size / (1024 * 1024);
    if (sizeInMB > maxSize) {
      setError(`La imagen no debe exceder ${maxSize}MB`);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target?.result as string;
        setPreview(base64);
        onChange(base64);
        setLoading(false);
      };
      reader.onerror = () => {
        setError('Error al leer la imagen');
        setLoading(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setError('Error al procesar la imagen');
      setLoading(false);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    onChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div
        onClick={() => !disabled && fileInputRef.current?.click()}
        className={`relative border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer transition-colors ${
          disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-primary hover:bg-muted'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          disabled={disabled || loading}
          className="hidden"
        />

        {preview ? (
          <div className="flex flex-col items-center gap-3">
            <img
              src={preview}
              alt="Preview"
              className="h-40 w-40 object-cover rounded-lg"
            />
            <p className="text-sm text-muted-foreground">Haz clic para cambiar la imagen</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <ImageIcon className="w-12 h-12 text-muted-foreground" />
            <p className="text-sm font-medium">Arrastra una imagen aquí o haz clic para seleccionar</p>
            <p className="text-xs text-muted-foreground">
              Máximo {maxSize}MB • Formatos: PNG, JPG, GIF
            </p>
          </div>
        )}

        {loading && (
          <div className="absolute inset-0 bg-background/50 rounded-lg flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        )}
      </div>

      {error && (
        <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg">
          {error}
        </div>
      )}

      {preview && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleRemove}
          disabled={disabled || loading}
          className="w-full"
        >
          <X className="w-4 h-4 mr-2" />
          Eliminar imagen
        </Button>
      )}
    </div>
  );
}
