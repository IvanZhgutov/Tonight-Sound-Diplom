import { useEffect } from 'react';

export function useDocumentTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} — Tonight Sound` : 'Tonight Sound — студия звукозаписи';
  }, [title]);
}
