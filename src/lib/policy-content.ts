export interface Policy {
  title: string
  // Each entry is a paragraph; entries ending in ":" render as a small heading.
  paragraphs: string[]
}

const CONTACT = 'contact@lusiant.co'

export const POLICIES: Record<string, Policy> = {
  'refund-policy': {
    title: 'Refund Policy',
    paragraphs: [
      'RETURNS AND EXCHANGES ARE ACCEPTED. PLEASE VIEW THE DETAILS BELOW.',
      'Online purchase and pre-made items: you have 7 days from the arrival date of your order to request a return/exchange.',
      'Items must be returned in original condition, meaning unwashed, unaltered, and free from stains, odors, or damage.',
      'Orders are not eligible for refunds, returns, or cancellations due to shipping or carrier delays, provided the order was shipped within our stated processing timeframe. Delivery times are estimates and are not guaranteed. Once an order has been shipped, delays caused by the carrier are outside of our control. If there is an issue with the item itself (damage, defect, or incorrect item), please contact us and we’ll be happy to help.',
      'PRE-ORDERS (Made to Order) items are FINAL SALE and cannot be returned nor exchanged except in the case of defects or if an incorrect item is shipped due to an error on our part.',
      'RAFFLE ITEMS ARE FINAL SALE.',
      'ALL ITEMS MUST MATCH THOSE IDENTIFIED IN THE RETURN/EXCHANGE REQUEST.',
      `Please contact ${CONTACT} for any questions, concerns, or inquiries.`,
    ],
  },
  'shipping-policy': {
    title: 'Shipping Policy',
    paragraphs: [
      'Orders are processed and shipped within 5–8 business days (excluding weekends and holidays). Processing time is separate from shipping transit time.',
      'Once shipped, delivery (transit time) typically takes 3–5 business days. Shipping times are estimates and not guaranteed.',
      'Delays may occur due to holidays or carrier volume. We are not responsible for delays once the package has been handed off to the carrier.',
      'For questions regarding delivery status, transit times, or carrier delays after shipment, please contact UPS or USPS directly using the tracking information provided.',
      'PRE-ORDERS (MADE TO ORDER):',
      'All pre-order (made to order) items will be explicitly indicated on the product page. These items have a longer production cycle, taking upwards of 4 to 14 weeks. Please note that since each piece is created upon order placement, it will enter our production queue. While we strive to be efficient, some items may take between 4 to 14 weeks to complete and reach your doorstep.',
    ],
  },
  'privacy-policy': {
    title: 'Privacy Policy',
    paragraphs: [
      'This Privacy Policy describes how Lusiant ("we", "us", or "our") collects, uses, and shares your personal information when you visit lusiant.co or make a purchase from us.',
      'Information we collect:',
      'When you place an order or contact us, we collect information you provide such as your name, email address, shipping address, and phone number. When you make a purchase, payment is processed securely by our payment provider (Stripe) — we do not store your full card number. As you browse, we may automatically collect device and usage information through cookies and similar technologies.',
      'How we use your information:',
      'We use your information to process and fulfill your orders, communicate with you about your order, provide customer support, prevent fraud, improve our store, and — if you opt in — send you marketing about new drops and offers.',
      'Sharing your information:',
      'We share personal information with service providers who perform services on our behalf, such as payment processing, order fulfillment and shipping, and email or SMS delivery. We do not sell your personal information. We may disclose information where required by law.',
      'Cookies:',
      'We use cookies to operate your shopping cart and to understand how our store is used. You can control or disable cookies through your browser settings, though some features may not function properly without them.',
      'Marketing:',
      'If you opt in to marketing emails or texts, you can unsubscribe at any time using the link in our emails or by replying STOP to texts.',
      'Data retention and security:',
      'We retain your information for as long as necessary to fulfill the purposes described here and to comply with legal obligations. We use reasonable safeguards to protect your information, but no method of transmission or storage is completely secure.',
      'Your rights:',
      `You may request to access, correct, or delete the personal information we hold about you by emailing ${CONTACT}.`,
      'Changes:',
      'We may update this Privacy Policy from time to time. The current version will always be posted on this page.',
      'Contact:',
      `If you have questions about this policy, contact us at ${CONTACT}.`,
    ],
  },
  'terms-of-service': {
    title: 'Terms of Service',
    paragraphs: [
      'By accessing or using lusiant.co and purchasing from us, you agree to these Terms of Service. If you do not agree, please do not use the site.',
      'Products and pricing:',
      'We work to display our products and their colors as accurately as possible, but we cannot guarantee that your display will be accurate. Prices and availability are subject to change without notice, and we may limit quantities.',
      'Orders:',
      'We reserve the right to refuse or cancel any order at any time. Payment is processed securely through Stripe, and by placing an order you confirm that you are authorized to use the payment method provided.',
      'Shipping and returns:',
      'Shipping timeframes and return eligibility are described in our Shipping Policy and Refund Policy, which form part of these terms.',
      'Intellectual property:',
      'All content on this site — including designs, graphics, logos, and images — is the property of Lusiant and may not be used or reproduced without our written permission.',
      'Acceptable use:',
      'You agree not to use the site for any unlawful purpose or in any way that could damage, disable, or impair the site.',
      'Disclaimer and limitation of liability:',
      'The site and products are provided on an "as is" and "as available" basis. To the fullest extent permitted by law, Lusiant is not liable for any indirect, incidental, or consequential damages arising from your use of the site or products.',
      'Governing law:',
      'These terms are governed by the laws of the United States and the state in which Lusiant operates, without regard to conflict of law principles.',
      'Changes:',
      'We may update these Terms of Service at any time. Continued use of the site after changes constitutes acceptance of the updated terms.',
      'Contact:',
      `Questions about these terms can be sent to ${CONTACT}.`,
    ],
  },
  'contact-information': {
    title: 'Contact Information',
    paragraphs: [
      'CONTACT US AT',
      `Email: ${CONTACT}`,
      'Instagram: @lusiant.sp',
    ],
  },
}

export const POLICY_LINKS: { slug: string; label: string }[] = [
  { slug: 'refund-policy', label: 'Refund policy' },
  { slug: 'privacy-policy', label: 'Privacy policy' },
  { slug: 'terms-of-service', label: 'Terms of service' },
  { slug: 'shipping-policy', label: 'Shipping policy' },
  { slug: 'contact-information', label: 'Contact information' },
]
