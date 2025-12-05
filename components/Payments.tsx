import React from 'react';
import { BusinessBlueprint, Client, ClientStatus } from '../types';
import { CreditCard, Link as LinkIcon, ExternalLink, Check } from 'lucide-react';

interface PaymentsProps {
  blueprint: BusinessBlueprint;
  clients?: Client[];
}

const Payments: React.FC<PaymentsProps> = ({ blueprint, clients = [] }) => {
  const { pricing } = blueprint.websiteData;

  const copyLink = (planName: string) => {
    alert(`Copied payment link for ${planName}: https://buy.stripe.com/test_${Math.random().toString(36).substring(7)}`);
  };

  // Logic to find transaction history based on active clients
  const transactions = clients
    .filter(c => c.status === ClientStatus.ACTIVE)
    .map(c => ({
        id: c.id,
        customer: c.name,
        amount: pricing[0]?.price || "$97",
        status: "Succeeded",
        date: c.joinDate
    }));

  const mrr = transactions.reduce((acc, curr) => {
      const val = parseInt(curr.amount.replace(/[^0-9]/g, '')) || 0;
      return acc + val;
  }, 0);

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Monetization</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Manage your products and Stripe payment links.</p>
        </div>
        <button className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-slate-800 dark:hover:bg-slate-100 flex items-center gap-2 transition-all">
          <ExternalLink size={18} /> Open Stripe Dashboard
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         {/* Summary Card */}
         <div className="bg-gradient-to-br from-slate-900 to-slate-800 dark:from-slate-800 dark:to-slate-900 text-white p-8 rounded-2xl shadow-xl md:col-span-3 lg:col-span-1 flex flex-col justify-between border border-slate-700">
            <div>
              <div className="flex items-center gap-2 text-slate-400 mb-2">
                <CreditCard size={18} />
                <span className="text-sm font-medium uppercase tracking-wide">Monthly Recurring Revenue</span>
              </div>
              <div className="text-4xl font-bold tracking-tight text-white">${mrr.toLocaleString()}.00</div>
            </div>
            <div className="mt-8 space-y-3">
              <div className="flex justify-between text-sm py-2 border-b border-slate-700/50">
                <span className="text-slate-400">Active Subscriptions</span>
                <span className="font-bold text-white">{transactions.length}</span>
              </div>
              <div className="flex justify-between text-sm py-2">
                <span className="text-slate-400">Avg. Revenue Per User</span>
                <span className="font-bold text-white">${transactions.length > 0 ? (mrr / transactions.length).toFixed(0) : 0}</span>
              </div>
            </div>
         </div>

         {/* Product Cards */}
         <div className="md:col-span-3 lg:col-span-2 grid md:grid-cols-2 gap-6">
            {pricing.map((plan, index) => (
              <div key={index} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-lg text-slate-900 dark:text-white">{plan.name}</h3>
                    <div className="text-3xl font-bold text-primary-600 dark:text-primary-400 mt-1">{plan.price}</div>
                  </div>
                  <div className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                    Active
                  </div>
                </div>

                <div className="space-y-3 mb-8 flex-1">
                  {plan.features.slice(0, 3).map((feat, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                      <Check size={14} className="text-green-500" /> {feat}
                    </div>
                  ))}
                </div>

                <button 
                  onClick={() => copyLink(plan.name)}
                  className="w-full flex items-center justify-center gap-2 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-medium py-3 rounded-xl transition-colors"
                >
                  <LinkIcon size={16} /> Copy Payment Link
                </button>
              </div>
            ))}
         </div>
      </div>

      {/* Transaction List */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800">
          <h3 className="font-bold text-slate-900 dark:text-white">Recent Transactions</h3>
        </div>
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400">
            <tr>
              <th className="px-6 py-4 font-semibold">Customer</th>
              <th className="px-6 py-4 font-semibold">Amount</th>
              <th className="px-6 py-4 font-semibold">Status</th>
              <th className="px-6 py-4 font-semibold text-right">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {transactions.length === 0 ? (
                <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-slate-500 dark:text-slate-400">
                        No transactions found. Add active clients to the CRM to see revenue.
                    </td>
                </tr>
            ) : transactions.map((tx, i) => (
              <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{tx.customer}</td>
                <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{tx.amount}</td>
                <td className="px-6 py-4"><span className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2.5 py-1 rounded-full text-xs font-medium">Succeeded</span></td>
                <td className="px-6 py-4 text-slate-500 dark:text-slate-400 text-right">{tx.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Payments;