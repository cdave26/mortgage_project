/** @type {import('next').NextConfig} */

/**
 * DO NOT FORMAT ON SAVE
 */
const ContentSecurityPolicy = `
    default-src 'self' ${process.env.REACT_APP_API_SERVICE_URL} blob:;
    script-src 'self' 'sha256-4sNwvmWshEzqW5S25HVAak+QIUCkjYSbAaQ7Ieh/EDA=' https://js.stripe.com blob: ${process.env.NODE_ENV === "development" ? "'unsafe-eval'" : ""};
    connect-src 'self' ${process.env.REACT_APP_API_SERVICE_URL} ${process.env.STORAGE_URL} https://chart.googleapis.com ${process.env.WS}/_next/webpack-hmr https://r.stripe.com https://js.stripe.com  https://api.ipify.org ${process.env.PUSHER_WS};
    font-src 'self' blob: data:;
    style-src 'self' https://fonts.googleapis.com 'unsafe-inline';
    frame-ancestors 'self' ${process.env.REACT_APP_API_SERVICE_URL} blob:;
    form-action 'self';
    object-src 'self' data:;
    worker-src 'self' blob:;
    frame-src 'self' ${process.env.REACT_APP_API_SERVICE_URL} blob:;
    img-src 'self' ${process.env.REACT_APP_API_SERVICE_URL} ${process.env.STORAGE_URL} https://hips.hearstapps.com https://chart.googleapis.com blob: data:;
    media-src 'self' data: blob:;
`;

const securityHeaders = [
  {
    key: "Content-Security-Policy",
    value: ContentSecurityPolicy.replace(/\s{2,}/g, " ").trim(),
  },
  {
    key: "X-Content-Security-Policy",
    value: ContentSecurityPolicy.replace(/\s{2,}/g, " ").trim(),
  },
];

const nextConfig = {
  reactStrictMode: false,
  staticPageGenerationTimeout: 1000,

  publicRuntimeConfig: {
    appName: "Uplist",
    appTitle: "Uplist",
  },
  // async headers() {
  //   return [
  //     {
  //       // Apply these headers to all routes in the application.
  //       source: "/:path*",
  //       headers: securityHeaders,
  //     },
  //   ];
  // },
  webpack: (config) => {
    config.module.rules.push({
      test: /\.css$\.scss$/,
      use: [
        {
          loader: "postcss-loader",
          options: {
            postcssOptions: {
              plugins: [
                "postcss-import",
                "tailwindcss/nesting",
                "tailwindcss",
                "autoprefixer",
                ...(process.env.NODE_ENV === "production" ? ["cssnano"] : []),
              ],
            },
          },
        },
      ],
      test: /\.css$\.scss$/,
      use: ["style-loader", "css-loader"],
    });

    return config;
  },

  env: {
    SECURITY_APP: process.env.SECURITY_APP,
    REACT_APP_API_SERVICE_URL: process.env.REACT_APP_API_SERVICE_URL,
    REACT_APP_URL: process.env.REACT_APP_URL,
    STORAGE_URL: process.env.STORAGE_URL,
    API_STORAGE_ENV: process.env.API_STORAGE_ENV,
    GOOGLE_ANALYTICS: process.env.GOOGLE_ANALYTICS,
    MAINTENANCE_MODE: process.env.MAINTENANCE_MODE,

    UPLIST_MARKETING_URL: process.env.UPLIST_MARKETING_URL,
    UPLIST_PRIVACY_POLICY_URL: process.env.UPLIST_PRIVACY_POLICY_URL,
    UPLIST_TOS_URL: process.env.UPLIST_TOS_URL,

    PUSHER_WS: process.env.PUSHER_WS,
    PUSHER_KEY: process.env.PUSHER_KEY,
    PUSHER_WSHOST: process.env.PUSHER_WSHOST,
    PUSHER_CLUSTER: process.env.PUSHER_CLUSTER,
    PUSHER_PORT: process.env.PUSHER_PORT,

    STRIPE_PRICING_1: process.env.STRIPE_PRICING_1,
    STRIPE_PRICING_2: process.env.STRIPE_PRICING_2,
    STRIPE_PRICING_3: process.env.STRIPE_PRICING_3,
    STRIPE_PRICING_SPECIAL: process.env.STRIPE_PRICING_SPECIAL,

    RECAPTCHA_SITE_KEY: process.env.RECAPTCHA_SITE_KEY,
    
    NGROK_CONNECTION: process.env.NGROK_CONNECTION,
  },
  poweredByHeader: false,
  trailingSlash: false,
};

module.exports = nextConfig;
