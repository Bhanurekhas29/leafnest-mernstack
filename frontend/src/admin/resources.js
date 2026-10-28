// One entry per admin "model". Mirrors the resources exposed by backend/src/routes/admin.js.
const order = { name: 'sort_order', label: 'Sort order', type: 'number', help: 'Lower numbers appear first on the website.' };
const active = { name: 'is_active', label: 'Show on website', type: 'bool', default: 1 };

export const groups = [
  { title: 'Website content', items: ['categories', 'packs', 'gallery', 'reviews', 'faqs'] },
  { title: 'Enquiries', items: ['quotes'] },
  { title: 'Authentication and authorization', items: ['admins'] },
];

export const resources = {
  categories: {
    label: 'Gift category', plural: 'Gift categories',
    columns: ['title', 'sort_order', 'is_active'],
    fields: [
      { name: 'title', label: 'Title', type: 'text', required: true },
      { name: 'description', label: 'Description', type: 'textarea' },
      { name: 'image', label: 'Image', type: 'image' },
      order, active,
    ],
  },
  packs: {
    label: 'Gift pack', plural: 'Gift packs',
    columns: ['title', 'min_qty', 'price_label', 'sort_order', 'is_active'],
    fields: [
      { name: 'title', label: 'Title', type: 'text', required: true },
      { name: 'description', label: 'Description', type: 'textarea' },
      { name: 'min_qty', label: 'Minimum quantity', type: 'text', help: 'For example: Minimum 50 pieces' },
      { name: 'price_label', label: 'Price label', type: 'text', default: 'Price on enquiry' },
      { name: 'image', label: 'Image', type: 'image' },
      order, active,
    ],
  },
  gallery: {
    label: 'Gallery photo', plural: 'Gallery photos',
    columns: ['caption', 'sort_order', 'is_active'],
    fields: [
      { name: 'caption', label: 'Caption', type: 'text', required: true },
      { name: 'image', label: 'Image', type: 'image' },
      order, active,
    ],
  },
  reviews: {
    label: 'Customer review', plural: 'Customer reviews',
    columns: ['author', 'role', 'sort_order', 'is_active'],
    fields: [
      { name: 'author', label: 'Author', type: 'text', required: true },
      { name: 'role', label: 'Role / event', type: 'text' },
      { name: 'quote', label: 'Review', type: 'textarea', required: true },
      order, active,
    ],
  },
  faqs: {
    label: 'FAQ', plural: 'FAQs',
    columns: ['question', 'sort_order', 'is_active'],
    fields: [
      { name: 'question', label: 'Question', type: 'text', required: true },
      { name: 'answer', label: 'Answer', type: 'textarea', required: true },
      order, active,
    ],
  },
  quotes: {
    label: 'Quote request', plural: 'Quote requests', noAdd: true,
    columns: ['name', 'phone', 'event_type', 'quantity', 'city', 'status', 'created_at'],
    fields: [
      { name: 'name', label: 'Name', type: 'text', required: true },
      { name: 'phone', label: 'Phone', type: 'text', required: true },
      { name: 'email', label: 'Email', type: 'email' },
      { name: 'event_type', label: 'Event type', type: 'text', required: true },
      { name: 'quantity', label: 'Quantity', type: 'text' },
      { name: 'event_date', label: 'Event date', type: 'text' },
      { name: 'city', label: 'Delivery city', type: 'text' },
      { name: 'message', label: 'Message', type: 'textarea' },
      { name: 'status', label: 'Status', type: 'select', options: ['new', 'contacted', 'closed'], default: 'new' },
    ],
  },
  admins: {
    label: 'Admin user', plural: 'Admin users',
    columns: ['username', 'email', 'is_active', 'last_login'],
    fields: [
      { name: 'username', label: 'Username', type: 'text', required: true },
      { name: 'email', label: 'Email', type: 'email', help: 'Used for password reset emails.' },
      { name: 'password', label: 'Password', type: 'password', help: 'At least 8 characters. Leave blank to keep the current password when editing.' },
      { name: 'is_active', label: 'Active', type: 'bool', default: 1, help: 'Unselect this instead of deleting accounts.' },
    ],
  },
};

export const columnLabel = (resource, name) =>
  resources[resource].fields.find((f) => f.name === name)?.label || name.replace(/_/g, ' ').replace(/^./, (c) => c.toUpperCase());
