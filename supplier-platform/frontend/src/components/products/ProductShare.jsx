// Frontend/src/components/products/ProductShare.jsx
import { useState } from 'react';
import { FiCopy, FiMail, FiFacebook, FiTwitter } from 'react-icons/fi';
import Button from '@/components/common/Button';
import { copyToClipboard } from '@/utils/helpers';
import { toast } from 'react-toastify';

const ProductShare = ({ productId, productUrl }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const success = await copyToClipboard(productUrl);
    if (success) {
      setCopied(true);
      toast.success('Link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${productUrl}`,
    twitter: `https://twitter.com/intent/tweet?url=${productUrl}`,
    email: `mailto:?subject=Check out this product&body=${productUrl}`,
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <input
          type="text"
          value={productUrl}
          readOnly
          className="input flex-1"
        />
        <Button
          variant={copied ? 'success' : 'primary'}
          onClick={handleCopy}
          icon={<FiCopy size={18} />}
        >
          {copied ? 'Copied!' : 'Copy'}
        </Button>
      </div>

      <div className="flex gap-2">
        <a
          href={shareLinks.facebook}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-secondary flex items-center gap-2"
        >
          <FiFacebook size={18} />
          Facebook
        </a>
        <a
          href={shareLinks.twitter}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-secondary flex items-center gap-2"
        >
          <FiTwitter size={18} />
          Twitter
        </a>
        <a
          href={shareLinks.email}
          className="btn btn-secondary flex items-center gap-2"
        >
          <FiMail size={18} />
          Email
        </a>
      </div>
    </div>
  );
};

export default ProductShare;