import Head from "next/head";
import SITE_CONFIG from "../config/site";
import React from "react";

type SeoProps = {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  keywords?: string;
};

function Seo({ title, description, image, url, keywords }: SeoProps) {
  return (
    <>
      {/* General Meta Tags */}
      <title>{title ?? SITE_CONFIG.headline}</title>
      <meta
        name="description"
        content={description ?? SITE_CONFIG.description}
      />
      <meta name="keywords" content={keywords ?? SITE_CONFIG.keywords} />
      <meta name="image" content={image ?? SITE_CONFIG.image} />
      <meta name="url" content={url ?? SITE_CONFIG.domain} />
      <meta name="robots" content="index, follow" />
      <meta name="googlebot" content="index, follow" />

      {/* Open Graph Meta Tags */}
      <meta property="og:title" content={title ?? SITE_CONFIG.headline} />
      <meta
        property="og:description"
        content={description ?? SITE_CONFIG.description}
      />
      <meta property="og:image" content={image ?? SITE_CONFIG.image} />
      <meta property="og:url" content={url ?? SITE_CONFIG.domain} />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="Veloz" />

      {/* Twitter Meta Tags */}
      <meta property="twitter:title" content={title ?? SITE_CONFIG.headline} />
      <meta
        property="twitter:description"
        content={description ?? SITE_CONFIG.description}
      />
      <meta name="twitter:image" content={image ?? SITE_CONFIG.image} />
      <meta property="twitter:url" content={url ?? SITE_CONFIG.domain} />
      <meta property="twitter:type" content="website" />
      <meta name="twitter:site" content="@tryveloz" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:creator" content="@tryveloz" />

      {/* Favicon */}
      <link rel="icon" href="/favicon.ico" />

      {/* Apple Touch Icon */}
      <meta name="apple-mobile-web-app-title" content="Veloz" />

      {/* Google search indexing */}
      <meta
        name="google-site-verification"
        content="ocD59DwPr5QESyBF5Mcje4y9ucq_I9ZCXN0cgJGAKBQ"
      />

      {/* Microsoft Tiles */}
      <meta name="msapplication-TileColor" content="#ffffff" />
      <meta name="theme-color" content="#ffffff" />
      <meta name="application-name" content="Veloz" />
      <meta name="msapplication-TileImage" content="/images/logo/logo.png" />
      {/* <meta name="msapplication-config" content="/browserconfig.xml" /> */}
    </>
  );
}

export default Seo;
