import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/lib/context/AuthContext';
import { getClubProduct, userHasProductAccess } from '@/lib/product-catalog';

export default function ProductEntitlementRoute({
  productKey,
  children,
}: {
  productKey: string;
  children: React.ReactElement;
}) {
  const location = useLocation();
  const { currentUser, isAuthenticated } = useAuth();
  const product = getClubProduct(productKey);

  if (!product) return children;

  if (!isAuthenticated || !currentUser) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  if (!userHasProductAccess(currentUser, product)) {
    return <Navigate to={'/products/' + product.slug + '?locked=1'} replace />;
  }

  return children;
}
