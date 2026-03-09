import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    HelpCircle, ChevronDown, ChevronUp, ShoppingCart, Package,
    FileText, BarChart2, Users, Mail, MessageCircle, Book
} from 'lucide-react';

const faqs = [
    {
        category: 'Getting Started',
        icon: Book,
        color: 'blue',
        questions: [
            {
                q: 'How do I register my shop?',
                a: 'On the login page, click "Register". Fill in your shop name, currency (AED for UAE or KWD for Kuwait), VAT preference, and create your admin credentials. Your shop is ready immediately after registration.'
            },
            {
                q: 'Can I add staff members to my shop?',
                a: 'Yes! Go to your Profile page and use the "Add Staff" section. Staff members can log in with their own username and password and will have access to POS and inventory — but not admin settings.'
            },
            {
                q: 'Is my data stored securely?',
                a: 'All data is stored in a secure PostgreSQL database hosted on Render with SSL encryption. Passwords are hashed using bcrypt and all API routes are protected with JWT authentication.'
            },
        ]
    },
    {
        category: 'Point of Sale (POS)',
        icon: ShoppingCart,
        color: 'green',
        questions: [
            {
                q: 'How do I use the barcode scanner?',
                a: 'In the POS page, click the barcode icon to activate your camera. Point it at a product barcode — it will automatically search and add the item to the cart.'
            },
            {
                q: 'How does VAT work?',
                a: 'VAT is automatically applied based on your shop currency. UAE shops apply 5% VAT; Kuwait shops apply 0%. You can toggle VAT on/off per shop in your Profile settings.'
            },
            {
                q: 'Can I apply a discount at checkout?',
                a: 'Yes. Enter a discount code in the POS cart section, or apply a manual percentage discount. Create discount codes in the "Discount Codes" section of the sidebar.'
            },
            {
                q: 'How do I handle partial (due) payments?',
                a: 'On the POS payment screen, enter the amount paid. Any remaining balance is automatically recorded as a "Due Payment" linked to the customer. Track and collect dues from the "Due Collection" page.'
            },
        ]
    },
    {
        category: 'Inventory & Products',
        icon: Package,
        color: 'purple',
        questions: [
            {
                q: 'How do I add a new product?',
                a: 'Go to Products → click "Add Product". Fill in the name, barcode, cost price, selling price, stock quantity, and optionally assign a category. The product will immediately be available in POS.'
            },
            {
                q: 'How do I adjust stock?',
                a: 'Use the "Stock Adjustments" page to add or subtract stock for any product. Each adjustment is logged with a reason for full traceability.'
            },
            {
                q: 'Can I organise products into categories?',
                a: 'Yes. In the Products page, click "Categories" to create and manage categories, then assign products to them when creating or editing a product.'
            },
        ]
    },
    {
        category: 'Invoices & Reports',
        icon: FileText,
        color: 'orange',
        questions: [
            {
                q: 'How do I generate a PDF invoice?',
                a: 'Go to the Invoices page, find the invoice you want, and click the PDF icon. A tax-compliant PDF invoice is generated and downloaded instantly.'
            },
            {
                q: 'What reports are available?',
                a: 'The Reports page shows daily sales totals, top-selling products, revenue trends, and expense summaries. Use the End of Day page to review and close out each day.'
            },
            {
                q: 'How do I track purchases from suppliers?',
                a: 'Use the Purchases page to create purchase orders. Link them to a supplier, add products and quantities, and the stock levels update automatically when you mark the order as received.'
            },
        ]
    },
];

const colorMap = {
    blue: { bg: 'bg-blue-50', icon: 'text-blue-600', border: 'border-blue-100', badge: 'bg-blue-100 text-blue-700' },
    green: { bg: 'bg-green-50', icon: 'text-green-600', border: 'border-green-100', badge: 'bg-green-100 text-green-700' },
    purple: { bg: 'bg-purple-50', icon: 'text-purple-600', border: 'border-purple-100', badge: 'bg-purple-100 text-purple-700' },
    orange: { bg: 'bg-orange-50', icon: 'text-orange-600', border: 'border-orange-100', badge: 'bg-orange-100 text-orange-700' },
};

const FAQItem = ({ q, a }) => {
    const [open, setOpen] = useState(false);
    return (
        <div className={`border border-slate-100 rounded-xl overflow-hidden transition-all duration-200 ${open ? 'shadow-md' : 'hover:border-slate-200'}`}>
            <button
                onClick={() => setOpen(!open)}
                className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left bg-white hover:bg-slate-50 transition-colors"
            >
                <span className="text-sm font-semibold text-slate-800">{q}</span>
                {open
                    ? <ChevronUp className="w-4 h-4 text-blue-600 flex-shrink-0" />
                    : <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
                }
            </button>
            {open && (
                <div className="px-5 pb-4 bg-white border-t border-slate-50">
                    <p className="text-sm text-slate-600 leading-relaxed pt-3">{a}</p>
                </div>
            )}
        </div>
    );
};

const Help = () => {
    const { i18n } = useTranslation();
    const isRTL = i18n.language === 'ar';

    return (
        <div className={`max-w-3xl mx-auto space-y-10 ${isRTL ? 'text-right' : 'text-left'}`}>
            {/* Header */}
            <div className="text-center space-y-3 pt-2">
                <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-50 rounded-2xl mb-2">
                    <HelpCircle className="w-7 h-7 text-blue-600" />
                </div>
                <h1 className="text-2xl font-black text-slate-900">Help & FAQ</h1>
                <p className="text-sm text-slate-500 max-w-md mx-auto">
                    Everything you need to know about using Hisabi-POS. Can't find an answer? Contact support below.
                </p>
            </div>

            {/* FAQ Sections */}
            {faqs.map((section) => {
                const Icon = section.icon;
                const colors = colorMap[section.color];
                return (
                    <div key={section.category} className="space-y-3">
                        <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                            <div className={`w-8 h-8 ${colors.bg} rounded-lg flex items-center justify-center`}>
                                <Icon className={`w-4 h-4 ${colors.icon}`} />
                            </div>
                            <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest">{section.category}</h2>
                        </div>
                        <div className="space-y-2">
                            {section.questions.map((item) => (
                                <FAQItem key={item.q} q={item.q} a={item.a} />
                            ))}
                        </div>
                    </div>
                );
            })}

            {/* Contact Support Card */}
            <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl p-6 text-white text-center space-y-4 shadow-xl shadow-blue-600/20">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-white/20 rounded-xl">
                    <MessageCircle className="w-6 h-6 text-white" />
                </div>
                <div>
                    <h3 className="text-base font-black">Still need help?</h3>
                    <p className="text-sm text-blue-100 mt-1">Our support team is ready to assist you.</p>
                </div>
                <a
                    href="mailto:support@hisabi.app"
                    className="inline-flex items-center gap-2 bg-white text-blue-700 text-sm font-black px-5 py-2.5 rounded-xl hover:bg-blue-50 transition-colors shadow-lg"
                >
                    <Mail className="w-4 h-4" />
                    support@hisabi.app
                </a>
            </div>
        </div>
    );
};

export default Help;
