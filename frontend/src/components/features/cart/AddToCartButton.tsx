'use client';

import { useState } from 'react';
import { ShoppingCart, Check } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useCartStore } from '@/lib/stores/cart-store';
import type { Course } from '@/types';

interface AddToCartButtonProps {
  course: Course;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showIcon?: boolean;
  variant?: 'primary' | 'secondary' | 'outline';
}

export function AddToCartButton({
  course,
  size = 'lg',
  className = '',
  showIcon = false,
  variant = 'primary',
}: AddToCartButtonProps) {
  const { addItem, hasItem, openCart } = useCartStore();
  const [isAdding, setIsAdding] = useState(false);
  const isInCart = hasItem(course.id);

  const handleAddToCart = () => {
    if (isInCart) {
      openCart();
      return;
    }

    setIsAdding(true);
    addItem({
      courseId: course.id,
      name: course.name,
      slug: course.slug,
      price: course.discountPrice || course.listPrice,
      imageUrl: course.thumbnailUrl || course.imageUrl || '',
      deliveryMethod: course.deliveryMethod,
    });

    // Open cart after a short delay
    setTimeout(() => {
      setIsAdding(false);
      openCart();
    }, 300);
  };

  return (
    <Button
      variant={isInCart ? 'secondary' : variant}
      size={size}
      className={`w-full ${className}`}
      onClick={handleAddToCart}
      disabled={isAdding}
    >
      {showIcon && (
        isInCart ? (
          <Check className="w-5 h-5 mr-2" />
        ) : (
          <ShoppingCart className="w-5 h-5 mr-2" />
        )
      )}
      {isInCart ? 'In Cart - View' : isAdding ? 'Adding...' : 'Enroll Now'}
    </Button>
  );
}

export default AddToCartButton;
