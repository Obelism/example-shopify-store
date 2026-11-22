import { cn } from "cn";
import { type ReactNode, Suspense } from "react";

import { ImproveVariants } from "@/components/improve/improve-variants";
import { BundleComponents, BundleParents } from "@/components/product-detail/bundle-components";
import { BuyButtons, PurchaseOptions } from "@/components/product-detail/buy-buttons";
import { BuyWithShopLogo } from "@/components/product-detail/buy-with-shop-logo";
import { ComplementaryProducts } from "@/components/product-detail/complementary-products";
import { GiftCardPurchaseForm } from "@/components/product-detail/gift-card-purchase-form";
import { ProductOpenGraph } from "@/components/product-detail/open-graph";
import {
  ProductForm,
  ProductFormOptions,
  ProductFormPrice,
} from "@/components/product-detail/product-form";
import {
  ProductInfoDescription,
  ProductInfoOptions,
} from "@/components/product-detail/product-info";
import {
  ColorImageCarouselItems,
  ColorImageGrid,
  ProductMedia,
} from "@/components/product-detail/product-media";
import { ProductPrice } from "@/components/product-detail/product-price";
import { ProductSchema } from "@/components/product-detail/schema";
import { BreadcrumbSchema } from "@/components/schema/breadcrumb-schema";
import { Icon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link } from "@/components/ui/link";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { shopConfig } from "@/lib/config";
import {
  getProductPurchaseOptions,
  getSelectedColorImage,
  getSharedImages,
  hasColorImagePartitioning,
  toProductFormInput,
  toStaticOptionGroups,
} from "@/lib/product";
import { type SelectedOptions } from "@/lib/product/types";
import type { ProductDetails, ProductVariant } from "@/lib/product/types";

import styles from "./product-detail-section.module.css";

export function ProductDetailSection({
  product,
  selectedOptionsPromise,
  variantPromise,
}: {
  product: ProductDetails;
  selectedOptionsPromise: Promise<SelectedOptions>;
  variantPromise: Promise<ProductVariant | undefined>;
}) {
  return (
    <>
      <ProductSchema
        product={{
          handle: product.handle,
          title: product.title,
          description: product.description,
          images: product.images,
          vendor: product.vendor,
          currencyCode: product.currencyCode,
          priceRange: product.priceRange,
          offerCount:
            product.variantsComplete && product.variants
              ? product.variants.length
              : product.variantsCount,
          availableForSale: product.availableForSale,
          sku: product.defaultVariantSku,
        }}
      />
      <ProductOpenGraph
        availableForSale={product.availableForSale}
        price={product.priceRange.minVariantPrice}
      />
      <BreadcrumbSchema
        items={[
          { name: shopConfig.site.name, path: "/" },
          ...(product.collection
            ? [
                {
                  name: product.collection.title,
                  path: `/collections/${product.collection.handle}`,
                },
              ]
            : []),
          { name: product.title, path: `/products/${product.handle}` },
        ]}
      />
      <div className={styles.layout}>
        <ProductMediaArea product={product} selectedOptionsPromise={selectedOptionsPromise} />
        <ProductInfoArea product={product} variantPromise={variantPromise} />
      </div>
    </>
  );
}

function ProductMediaArea({
  product,
  selectedOptionsPromise,
}: {
  product: ProductDetails;
  selectedOptionsPromise: Promise<SelectedOptions>;
}) {
  if (!hasColorImagePartitioning(product.options)) {
    return (
      <ProductMedia
        otherImages={product.images}
        videos={product.videos}
        title={product.title}
        className={styles.media}
      />
    );
  }

  return (
    <ProductMedia
      otherImages={getSharedImages(product.images, product.options)}
      videos={product.videos}
      title={product.title}
      className={styles.media}
      desktopSlot={
        // Color image is the LCP slot; a pulsing skeleton flashes harder than an empty image canvas.
        <Suspense fallback={<div className={styles.colorImageFallback} />}>
          <ResolvedColorImageGrid
            product={product}
            selectedOptionsPromise={selectedOptionsPromise}
          />
        </Suspense>
      }
      mobileSlot={
        <Suspense fallback={<div className={styles.colorSlideFallback} />}>
          <ResolvedColorImageCarousel
            product={product}
            selectedOptionsPromise={selectedOptionsPromise}
          />
        </Suspense>
      }
    />
  );
}

async function ResolvedColorImageGrid({
  product,
  selectedOptionsPromise,
}: {
  product: ProductDetails;
  selectedOptionsPromise: Promise<SelectedOptions>;
}) {
  const image = getSelectedColorImage(product, await selectedOptionsPromise);
  if (!image) return null;
  return <ColorImageGrid images={[image]} title={product.title} />;
}

async function ResolvedColorImageCarousel({
  product,
  selectedOptionsPromise,
}: {
  product: ProductDetails;
  selectedOptionsPromise: Promise<SelectedOptions>;
}) {
  const image = getSelectedColorImage(product, await selectedOptionsPromise);
  if (!image) return null;
  return <ColorImageCarouselItems images={[image]} title={product.title} />;
}

function ProductInfoArea({
  product,
  variantPromise,
}: {
  product: ProductDetails;
  variantPromise: Promise<ProductVariant | undefined>;
}) {
  const { options, handle, descriptionHtml } = product;
  const uniformStock = product.allVariantsInStock;
  const singleVariant = product.variantsCount === 1;
  const showBuyLabel = uniformStock && !singleVariant;
  const allInStock = product.defaultVariant?.availableForSale ?? product.availableForSale;
  const hasOptions = options.some((option) => option.values.length > 1);
  return (
    <div className={styles.info}>
      <div className={styles.summary} data-uniform-price={product.hasUniformPricing}>
        <div className={styles.header}>
          {product.collection ? (
            <Link href={`/collections/${product.collection.handle}`} className={styles.collection}>
              {product.collection.title}
            </Link>
          ) : null}
          <h1 className={styles.title}>{product.title}</h1>
          {product.vendor ? (
            <p className={styles.vendor}>{product.vendor} · Archival pigment print, signed</p>
          ) : null}
          {product.hasUniformPricing ? (
            <ProductPrice
              amount={product.priceRange.minVariantPrice.amount}
              currencyCode={product.priceRange.minVariantPrice.currencyCode}
              compareAtAmount={product.compareAtPriceRange?.minVariantPrice.amount}
            />
          ) : null}
        </div>

        {singleVariant ? (
          <ProductInfoContent
            priceSlot={
              !product.hasUniformPricing ? (
                <Suspense fallback={<div className={styles.priceFallback} aria-hidden />}>
                  <ResolvedProductPrice variantPromise={variantPromise} />
                </Suspense>
              ) : undefined
            }
            product={product}
            selectedVariant={product.defaultVariant}
          />
        ) : (
          <Suspense
            fallback={
              <ProductInfoFallback
                allInStock={allInStock}
                hasOptions={hasOptions}
                product={product}
                showLabel={showBuyLabel}
              />
            }
          >
            <ResolvedProductInfo product={product} variantPromise={variantPromise} />
          </Suspense>
        )}
      </div>

      {!product.isGiftCard && shopConfig.pdp.bundles.isEnabled ? (
        <BundleRelationships variant={product.defaultVariant} />
      ) : null}

      {!product.isGiftCard && shopConfig.pdp.complementaryProducts.isEnabled ? (
        <ComplementaryProducts handle={handle} limit={4} title="Pairs Well With" />
      ) : null}

      <ProductInfoDescription descriptionHtml={descriptionHtml} />
    </div>
  );
}

async function ResolvedProductPrice({
  variantPromise,
}: {
  variantPromise: Promise<ProductVariant | undefined>;
}) {
  const variant = await variantPromise;
  return (
    <ProductFormPrice
      fallbackVariant={
        variant ? { compareAtPrice: variant.compareAtPrice, price: variant.price } : undefined
      }
    />
  );
}

async function ResolvedProductInfo({
  product,
  variantPromise,
}: {
  product: ProductDetails;
  variantPromise: Promise<ProductVariant | undefined>;
}) {
  return <ProductInfoContent product={product} selectedVariant={await variantPromise} />;
}

// The store is seeded from the URL-resolved variant so server HTML and client state agree on first paint.
function ProductInfoContent({
  priceSlot,
  product,
  selectedVariant,
}: {
  priceSlot?: ReactNode;
  product: ProductDetails;
  selectedVariant: ProductVariant | undefined;
}) {
  const formProduct = toProductFormInput(product, selectedVariant);
  const fallbackVariant = formProduct.selectedOrFirstAvailableVariant ?? undefined;
  const hasOptions = product.options.some((option) => option.values.length > 1);

  return (
    <ProductForm product={formProduct}>
      <div className={styles.content}>
        {!product.hasUniformPricing ? (
          <div>{priceSlot ?? <ProductFormPrice fallbackVariant={fallbackVariant} />}</div>
        ) : null}
        {hasOptions ? <ProductFormOptions handle={product.handle} /> : null}
        <ImproveVariants
          fallback="control"
          kind="test"
          slug="print-page-details"
          variants={{
            control: null,
            details: (
              <p className={styles.details}>
                Printed to order · Signed on the back · Ships in 2 weeks
              </p>
            ),
          }}
        />
        {product.isGiftCard ? (
          <GiftCardPurchaseForm />
        ) : (
          <BuyButtons
            fallbackVariant={fallbackVariant}
            availableForSale={product.availableForSale}
            buyWithShop={shopConfig.pdp.buyWithShop.isEnabled}
            quantityPicker={shopConfig.pdp.quantityPicker.isEnabled}
          />
        )}
      </div>
    </ProductForm>
  );
}

function ProductInfoFallback({
  showLabel,
  allInStock,
  hasOptions,
  product,
}: {
  allInStock: boolean;
  hasOptions: boolean;
  product: ProductDetails;
  showLabel: boolean;
}) {
  return (
    <div className={styles.content}>
      {!product.hasUniformPricing ? <div className={styles.priceFallback} aria-hidden /> : null}
      {hasOptions ? (
        <ProductInfoOptions options={toStaticOptionGroups(product)} hideImages />
      ) : null}
      {product.isGiftCard ? (
        <GiftCardPurchaseFormFallback />
      ) : (
        <BuyButtonsFallback
          allInStock={allInStock}
          showLabel={showLabel}
          variant={product.defaultVariant}
        />
      )}
    </div>
  );
}

// Bundle relationships are product-level, so keep them in the static shell.
function BundleRelationships({ variant }: { variant: ProductVariant | undefined }) {
  if (!variant) return null;
  if (variant.components.length === 0 && variant.bundleParents.length === 0) return null;
  return (
    <div className={styles.bundles}>
      <BundleComponents components={variant.components} title="Bundle Includes" />
      <BundleParents variants={variant.bundleParents} title="Available in Bundles" />
    </div>
  );
}

function GiftCardPurchaseFormFallback() {
  // Match the resolved form's geometry to avoid layout shift.
  return (
    <div className={styles.giftCard}>
      <div className={styles.fields}>
        <div className={styles.field}>
          <Label>Recipient email</Label>
          <Input type="email" disabled placeholder="friend@example.com" />
        </div>
        <div className={styles.field}>
          <Label>Recipient name</Label>
          <Input type="text" disabled placeholder="Friend's name (optional)" />
        </div>
        <div className={styles.field}>
          <Label>Message</Label>
          <Textarea rows={3} disabled placeholder="Write a personal note (optional)" />
        </div>
        <div className={styles.schedule}>
          <div className={styles.scheduleRow}>
            <Label>Schedule for later</Label>
            <span className={styles.switch} />
          </div>
        </div>
      </div>
      <div className={styles.giftCardSubmit}>Add to Cart</div>
    </div>
  );
}

function QuantityPickerFallback() {
  return (
    <div aria-hidden="true" className={styles.quantity}>
      <span className={styles.step} data-disabled="true">
        <Icon name="minus" size={16} className={styles.stepIcon} />
      </span>
      <span className={styles.count}>1</span>
      <span className={styles.step}>
        <Icon name="plus" size={16} className={styles.stepIcon} />
      </span>
    </div>
  );
}

function BuyButtonsFallback({
  allInStock,
  showLabel,
  variant,
}: {
  allInStock: boolean;
  showLabel: boolean;
  variant: ProductVariant | undefined;
}) {
  const { plans, selectedPlan } = getProductPurchaseOptions(variant);
  return (
    <div className={styles.buy}>
      {variant ? (
        <PurchaseOptions
          disabled
          plans={plans}
          price={variant.price}
          requiresSellingPlan={variant.requiresSellingPlan}
          selectedPlan={selectedPlan}
        />
      ) : null}
      <div className={styles.buyRow}>
        {shopConfig.pdp.quantityPicker.isEnabled ? <QuantityPickerFallback /> : null}
        <div className={styles.addToCart}>
          {showLabel ? (allInStock ? "Add to Cart" : "Out of Stock") : null}
        </div>
      </div>
      {shopConfig.pdp.buyWithShop.isEnabled && !selectedPlan && !variant?.requiresSellingPlan ? (
        <div className={styles.shopPay} data-available={allInStock}>
          <BuyWithShopLogo aria-hidden="true" className={styles.shopLogo} />
        </div>
      ) : null}
    </div>
  );
}

export function ProductDetailSkeleton() {
  return (
    <div aria-busy="true" className={styles.layout}>
      <div className={styles.media}>
        {/* Media blocks stay static; a pulsing skeleton in the LCP slot flashes harder than an empty image canvas. */}
        {/* Prints have one landscape image; most are 3:2. */}
        <div className={styles.skeletonMobile}>
          <div className={styles.skeletonCarousel} />
          <div aria-hidden="true" className={styles.skeletonDots} />
        </div>
        <div className={styles.skeletonDesktop}>
          <div className={styles.skeletonImage} />
        </div>
      </div>
      <div className={styles.info}>
        <div className={styles.content}>
          <div className={styles.header}>
            <Skeleton className={styles.skeletonCollection} />
            <Skeleton className={styles.skeletonTitle} />
            <Skeleton className={styles.skeletonVendor} />
            <Skeleton className={styles.skeletonPrice} />
          </div>
          <div className={styles.content}>
            <div className={styles.skeletonOptions}>
              <Skeleton className={styles.skeletonOptionGroup} />
              <div className={styles.field}>
                <Skeleton className={styles.skeletonOptionName} />
                <div className={styles.skeletonValues}>
                  {[
                    styles.skeletonValueNarrow,
                    styles.skeletonValueWide,
                    styles.skeletonValueWide,
                    styles.skeletonValueNarrow,
                    styles.skeletonValueNarrow,
                  ].map((width, index) => (
                    <Skeleton key={index} className={cn(styles.skeletonValue, width)} />
                  ))}
                </div>
              </div>
            </div>
            <div className={styles.buy}>
              <div className={styles.buyRow}>
                {shopConfig.pdp.quantityPicker.isEnabled ? <QuantityPickerFallback /> : null}
                <Skeleton className={styles.skeletonAddToCart} />
              </div>
              {shopConfig.pdp.buyWithShop.isEnabled ? (
                <Skeleton className={styles.skeletonShopPay} />
              ) : null}
            </div>
          </div>
        </div>
        <div className={styles.skeletonDescription}>
          <Skeleton className={styles.skeletonDescriptionTitle} />
          <Skeleton className={styles.skeletonLine} />
          <Skeleton className={styles.skeletonLineShort} />
        </div>
      </div>
    </div>
  );
}
