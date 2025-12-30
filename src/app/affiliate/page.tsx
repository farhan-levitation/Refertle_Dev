"use client";

import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
import Image from "next/image";
import { FormData } from "@/components/campaign";
import Link from "next/link";
const CampaignsTab = dynamic(() => import("./CampaignsTab"), { ssr: false });
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface AffiliateStats {
  totalEarnings: number;
  totalClicks: number;
  totalLeads: number;
  totalReferredCustomers: number;
  totalCampaigns: number;
  activeCampaigns: number;
  referralLink: string;
  referralCode: string;
}

interface Referral {
  id: string;
  leadName: string;
  leadEmail: string;
  company?: string;
  estimatedValue: number;
  status: string;
  createdAt: string;
  amountPaid?: number;
  commission?: number;
}

interface Campaign {
  id: string;
  name: string;
  status: "Active" | "Paused" | "Completed" | "Draft";
  revenue: number;
  conversions: number;
  // Add other campaign properties as needed
}

interface Payout {
  id: string;
  amount: number;
  status: string;
  method: string;
  createdAt: string;
  paidAt?: string;
}

// Dashboard Page Component
function DashboardPage({
  stats,
  referrals,
}: {
  stats: AffiliateStats | null;
  referrals: Referral[];
  campaigns: Campaign[];
}) {
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(
    null
  );
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const handleViewCampaign = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    setIsViewModalOpen(true);
  };
  const closeModal = () => {
    setIsViewModalOpen(false);
    setSelectedCampaign(null);
  };
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  // Get and filter active campaigns from local storage
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Memoize active campaigns to avoid recalculating on every render
  // const activeCampaigns = useMemo(
  //   () =>
  //     campaigns.filter(
  //       (campaign) => campaign.status?.toLowerCase() === "active"
  //     ),
  //   [campaigns]
  // );

  // Fetch campaigns from backend API
  useEffect(() => {
    const fetchCampaigns = async () => {
      const apiUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/campaigns?shop=${process.env.NEXT_PUBLIC_SHOP_NAME}`;
      try {
        setIsLoading(true);
        const response = await fetch(apiUrl);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setCampaigns(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error fetching campaigns:", err);
        setError("Failed to load campaigns. Please try again later.");
        setCampaigns([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCampaigns();
  }, []);

  const activeCampaigns = useMemo(
    () =>
      campaigns.filter(
        (campaign) => campaign.status?.toLowerCase() === "active"
      ),
    [campaigns]
  );

  const handleDeleteCampaign = async () => {
    if (!selectedCampaign) return;

    try {
      const response = await fetch(
        `http://localhost:4000/api/campaigns/${selectedCampaign.id}?shop=jindaal-2.myshopify.com`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete campaign");
      }

      // Update local state to reflect the deletion
      setCampaigns((prevCampaigns) =>
        prevCampaigns.filter((campaign) => campaign.id !== selectedCampaign.id)
      );

      closeModal();
    } catch (err) {
      console.error("Error deleting campaign:", err);
      // You might want to show an error message to the user here
    }
  };

  // Sample data - replace with your actual data
  const referralData = [
    { date: "Jan", clicks: 4000, conversions: 2400 },
    { date: "Feb", clicks: 3000, conversions: 1398 },
    { date: "Mar", clicks: 2000, conversions: 9800 },
    { date: "Apr", clicks: 2780, conversions: 3908 },
    { date: "May", clicks: 1890, conversions: 4800 },
    { date: "Jun", clicks: 2390, conversions: 3800 },
  ];

  const campaignData = activeCampaigns.map((campaign) => {
    // Safely handle missing or invalid campaign names
    const campaignName =
      typeof campaign.name === "string" && campaign.name.trim().length > 0
        ? campaign.name
        : "Unnamed Campaign";

    // Get the first word of the campaign name for the X-axis
    const firstName = campaignName.split(" ")[0];
    return {
      // Short name for X-axis
      name: firstName.charAt(0).toUpperCase() + firstName.slice(1),
      // Full name for tooltip
      fullName: campaignName,
      revenue: campaign.revenue || 0,
      conversions: campaign.conversions || 0,
    };
  });
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200">
          <p className="font-semibold">{data.fullName || label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const monthlyData = [
    { month: "Jan", revenue: 4000 },
    { month: "Feb", revenue: 3000 },
    { month: "Mar", revenue: 2000 },
    { month: "Apr", revenue: 2780 },
    { month: "May", revenue: 1890 },
    { month: "Jun", revenue: 2390 },
  ];

  const funnelData = [
    { stage: "Link Generated", value: 100 },
    { stage: "Clicks", value: 200 },
    { stage: "Purchases", value: 50 },
    { stage: "Reward Issued", value: 50 },
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg shadow-gray-200/50 border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-gray-500 font-medium">
              Revenue from referrals{" "}
            </span>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/30 group-hover:scale-110 transition-transform">
              <span className="text-white">💰</span>
            </div>
          </div>
          <p className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">
            ₹{((stats?.totalEarnings || 0) / 100).toFixed(2)}
          </p>
          <p className="text-xs text-gray-400 mt-2">Lifetime revenue</p>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg shadow-gray-200/50 border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-gray-500 font-medium">
              Successful referrals{" "}
            </span>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/30 group-hover:scale-110 transition-transform">
              <span className="text-white">👆</span>
            </div>
          </div>
          <p className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">
            {stats?.totalClicks || 0}
          </p>
          <p className="text-xs text-gray-400 mt-2">referrals</p>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg shadow-gray-200/50 border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-gray-500 font-medium">
              Total Campaigns
            </span>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/30 group-hover:scale-110 transition-transform">
              <span className="text-white">📊</span>
            </div>
          </div>
          <p className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">
            {isLoading ? "..." : campaigns.length}
          </p>
          <p className="text-xs text-gray-400 mt-2">campaigns</p>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg shadow-gray-200/50 border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-gray-500 font-medium">
              Active Campaigns
            </span>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/30 group-hover:scale-110 transition-transform">
              <span className="text-white">✅</span>
            </div>
          </div>
          <p className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">
            {isLoading ? "..." : activeCampaigns.length}
          </p>
          <p className="text-xs text-gray-400 mt-2">campaigns</p>
        </div>
      </div>
      {/* Referral Funnel */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg shadow-gray-200/50 border border-gray-100 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-5">
          Referral Funnel
        </h3>
        <div className="flex items-center justify-between overflow-x-auto pb-2 -mx-2">
          {[
            { label: "Links generated", count: 100, color: "#f4f3ef" },
            { label: "Clicks", count: 200, color: "#efeee8" },
            { label: "Purchases", count: 50, color: "#eae8e0" },
            { label: "Reward issued", count: 50, color: "#e5e3d9" },
          ].map((item, index) => (
            <div key={item.label} className="flex items-center justify-center ">
              <div className="flex items-center justify-between w-full mx-2">
                <div
                  className="min-w-[230px] px-4 py-3 text-left rounded-lg border border-gray-100"
                  style={{ backgroundColor: item.color }}
                >
                  <div className="text-sm text-gray-600">{item.label}</div>
                  <div className="text-lg font-bold text-gray-900">
                    {item.count}
                  </div>
                </div>
                {/* {index < 3 && (
                  <div className=" text-gray-300 mx-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="m9 18 6-6-6-6" />
                    </svg>
                  </div>
                )} */}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Graph 1: Referral Performance Over Time (Line Graph) */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg shadow-gray-200/50 border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Referral Performance Over Time
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={referralData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="clicks"
                  stroke="#10b981"
                  name="Clicks"
                />
                <Line
                  type="monotone"
                  dataKey="conversions"
                  stroke="#3b82f6"
                  name="Conversions"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Graph 2: Campaign Performance (Column Graph) */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg shadow-gray-200/50 border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Campaign Performance
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={campaignData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="revenue" fill="#10b981" name="Revenue (₹)" />
                <Bar dataKey="conversions" fill="#3b82f6" name="Conversions" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Graph 3: Monthly Campaign Performance (Column Graph) */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg shadow-gray-200/50 border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Monthly Performance
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="revenue" fill="#10b981" name="Revenue (₹)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Graph 4: Funnel Stage Performance (Column Graph) */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg shadow-gray-200/50 border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Funnel Stage Performance
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={funnelData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="stage" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#8b5cf6" name="Count" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Active Campaigns */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg shadow-gray-200/50 border border-gray-100 p-6 mb-6">
        <div className="text-gray-900 mb-5 flex items-center justify-between">
          <h3 className="text-lg font-bold">Active Campaigns</h3>
          <button className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-white rounded-lg px-4 py-2">
            <Link href="/affiliate/createCampaign">Create Campaign</Link>
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50/50">
                <th className="text-left py-4 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="text-left py-4 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="text-right py-4 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Revenue
                </th>
                <th className="text-right py-4 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Conversions
                </th>
                <th className="text-right py-4 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {activeCampaigns.length > 0 ? (
                activeCampaigns.map((campaign: Campaign) => (
                  <tr
                    key={campaign.id}
                    className="border-b border-gray-100 hover:bg-indigo-50/30 transition-colors"
                  >
                    <td className="py-4 px-5 text-sm font-medium text-gray-900">
                      {campaign.name}
                    </td>
                    <td className="py-4 px-5">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          campaign.status === "Active"
                            ? "bg-emerald-100 text-emerald-700"
                            : campaign.status === "Paused"
                              ? "bg-amber-100 text-amber-700"
                              : campaign.status === "Completed"
                                ? "bg-blue-100 text-blue-700"
                                : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {campaign.status}
                      </span>
                    </td>
                    <td className="py-4 px-5 text-sm font-semibold text-gray-900 text-right">
                      ₹{campaign.revenue || 0}
                    </td>
                    <td className="py-4 px-5 text-sm text-gray-500 text-right">
                      {campaign.conversions || 0}
                    </td>
                    <td className="py-4 px-5 text-right">
                      <button
                        className="text-emerald-600 hover:text-emerald-700 text-sm font-medium"
                        onClick={() => handleViewCampaign(campaign)}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-12 text-center">
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <div className="w-16 h-16 rounded-full bg-indigo-50 flex items-center justify-center">
                        <svg
                          className="w-8 h-8 text-indigo-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M13 10V3L4 14h7v7l9-11h-7z"
                          />
                        </svg>
                      </div>
                      <p className="text-gray-600 font-medium">
                        No active campaigns
                      </p>
                      <p className="text-sm text-gray-400">
                        Your active campaigns will appear here
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      <AnimatePresence>
        {isViewModalOpen && selectedCampaign && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={closeModal}
          >
            <motion.div
              className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <h3 className="text-xl font-bold text-gray-900">
                    {selectedCampaign.name}
                  </h3>
                  <button
                    onClick={closeModal}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <svg
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        Status
                      </p>
                      <p className="mt-1 text-sm text-gray-900 capitalize">
                        {selectedCampaign.status}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        Revenue
                      </p>
                      <p className="mt-1 text-sm text-gray-900">
                        ₹{selectedCampaign.revenue || 0}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        Conversions
                      </p>
                      <p className="mt-1 text-sm text-gray-900">
                        {selectedCampaign.conversions || 0}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        Campaign ID
                      </p>
                      <p className="mt-1 text-sm text-gray-900 font-mono">
                        {selectedCampaign.id}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="mt-8 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Close
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (
                        confirm(
                          "Are you sure you want to delete this campaign? This action cannot be undone."
                        )
                      ) {
                        handleDeleteCampaign();
                      }
                    }}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 "
                  >
                    Delete
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Rewards Page Component
function RewardsPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogMessage, setDialogMessage] = useState("");

  const [rewardConfig, setRewardConfig] = useState(() => {
    const savedConfig =
      typeof window !== "undefined"
        ? localStorage.getItem("rewardConfig")
        : null;
    return savedConfig
      ? JSON.parse(savedConfig)
      : { pointValue: 0.1, expiryDays: 30 };
  });

  useEffect(() => {
    localStorage.setItem("rewardConfig", JSON.stringify(rewardConfig));
  }, [rewardConfig]);
  const handleRewardConfigSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setDialogMessage("Reward settings saved successfully!");
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Rewards</h2>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="space-y-6">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg shadow-gray-200/50 border border-gray-100 p-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Current Reward Point Settings
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-4 border border-emerald-100 shadow-sm">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-emerald-100 rounded-lg">
                      <svg
                        className="w-6 h-6 text-emerald-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        1 Point Value
                      </p>
                      <p className="text-xl font-bold text-gray-900">
                        ₹{rewardConfig.pointValue.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100 shadow-sm">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <svg
                        className="w-6 h-6 text-blue-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        Expires After
                      </p>
                      <p className="text-xl font-bold text-gray-900">
                        {rewardConfig.expiryDays} days
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              Reward Point Settings
            </h3>

            <form onSubmit={handleRewardConfigSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="pointValue"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Value per Reward Point (INR)
                </label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">₹</span>
                  </div>
                  <input
                    type="number"
                    name="pointValue"
                    id="pointValue"
                    min="0.1"
                    step="0.1"
                    value={rewardConfig.pointValue}
                    onChange={(e) =>
                      setRewardConfig({
                        ...rewardConfig,
                        pointValue: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="focus:ring-teal-500 focus:border-teal-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md py-2 border"
                    placeholder="1.00"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <span
                      className="text-gray-500 sm:text-sm"
                      id="price-currency"
                    >
                      INR
                    </span>
                  </div>
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  This is the value of 1 reward point in Indian Rupees.
                </p>
              </div>
              <div>
                <label
                  htmlFor="expiryDays"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Reward Points Expiry (Days)
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <input
                    type="number"
                    name="expiryDays"
                    id="expiryDays"
                    min="1"
                    value={rewardConfig.expiryDays}
                    onChange={(e) =>
                      setRewardConfig({
                        ...rewardConfig,
                        expiryDays: parseInt(e.target.value) || 30,
                      })
                    }
                    className="focus:ring-teal-500 focus:border-teal-500 block w-full sm:text-sm border-gray-300 rounded-md py-2 border pl-3 pr-12"
                    placeholder="30"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm" id="expiry-days">
                      days
                    </span>
                  </div>
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  Points will expire after this many days from the date they are
                  earned.
                </p>
              </div>
              <div className="pt-2">
                <button
                  type="submit"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
                >
                  Save Settings
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      <AnimatePresence>
        {isDialogOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, y: -50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -50, scale: 0.9 }}
              transition={{ type: "spring", damping: 20, stiffness: 300 }}
              className="bg-white rounded-xl p-6 max-w-sm w-full shadow-xl"
            >
              <div className="flex items-center justify-center mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
              </div>
              <h3 className="text-lg font-semibold text-center text-gray-900 mb-2">
                Success!
              </h3>
              <p className="text-gray-600 text-center mb-6">{dialogMessage}</p>
              <div className="flex justify-center">
                <button
                  onClick={() => setIsDialogOpen(false)}
                  className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors"
                >
                  Got it!
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Payouts Page Component
function PayoutsPage({
  stats,
  payouts,
}: {
  stats: AffiliateStats | null;
  payouts: Payout[];
}) {
  const totalPaid = payouts
    .filter((p) => p.status === "COMPLETED")
    .reduce((sum, p) => sum + p.amount, 0);

  const pendingAmount = payouts
    .filter((p) => p.status === "PENDING")
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="space-y-6 animate-fadeIn">
      <h2 className="text-2xl font-bold text-gray-900">Payouts</h2>

      {/* Earnings Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg shadow-gray-200/50 border border-gray-100 p-6 hover:shadow-xl transition-all duration-300">
          <p className="text-sm text-gray-500 font-medium mb-2">Total Earned</p>
          <p className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">
            ₹{((stats?.totalEarnings || 0) / 100).toFixed(2)}
          </p>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg shadow-gray-200/50 border border-gray-100 p-6 hover:shadow-xl transition-all duration-300">
          <p className="text-sm text-gray-500 font-medium mb-2">Total Paid</p>
          <p className="text-3xl font-bold text-emerald-600">
            ₹{(totalPaid / 100).toFixed(2)}
          </p>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg shadow-gray-200/50 border border-gray-100 p-6 hover:shadow-xl transition-all duration-300">
          <p className="text-sm text-gray-500 font-medium mb-2">Pending</p>
          <p className="text-3xl font-bold text-amber-600">
            ₹{(pendingAmount / 100).toFixed(2)}
          </p>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg shadow-gray-200/50 border border-gray-100 p-6 hover:shadow-xl transition-all duration-300">
          <p className="text-sm text-gray-600 mb-2">Next Payout</p>
          <p className="text-lg font-bold text-gray-900">Jan 1, 2026</p>
          <p className="text-xs text-gray-500 mt-1">Monthly cycle</p>
        </div>
      </div>

      {/* Payout History */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Payout History
        </h3>
        {payouts.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No payouts yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">
                    Date
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">
                    Method
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">
                    Status
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-700">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody>
                {payouts.map((payout) => (
                  <tr
                    key={payout.id}
                    className="border-b border-gray-100 hover:bg-gray-50"
                  >
                    <td className="py-3 px-4 text-sm text-gray-900">
                      {new Date(
                        payout.paidAt || payout.createdAt
                      ).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {payout.method}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          payout.status === "COMPLETED"
                            ? "bg-green-100 text-green-800"
                            : payout.status === "FAILED"
                              ? "bg-red-100 text-red-800"
                              : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {payout.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-900 text-right font-medium">
                      ₹{(payout.amount / 100).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// Settings Page Component
function SettingsPage({
  settingsForm,
  setSettingsForm,
  onUpdate,
}: {
  settingsForm: any;
  setSettingsForm: (form: any) => void;
  onUpdate: (field: string) => void;
}) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Settings</h2>

      {/* Personal Details */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-gray-900">
            Personal Details
          </h3>
          <button
            onClick={() => onUpdate("Personal Details")}
            className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 text-sm font-medium"
          >
            Update
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name
            </label>
            <input
              type="text"
              value={settingsForm.name}
              onChange={(e) =>
                setSettingsForm({ ...settingsForm, name: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="John Doe"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number
            </label>
            <input
              type="text"
              value={settingsForm.phoneNumber}
              onChange={(e) =>
                setSettingsForm({
                  ...settingsForm,
                  phoneNumber: e.target.value,
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Phone Number"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              value={settingsForm.email}
              onChange={(e) =>
                setSettingsForm({ ...settingsForm, email: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="john@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Country
            </label>
            <select
              value={settingsForm.country}
              onChange={(e) =>
                setSettingsForm({ ...settingsForm, country: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="India">India</option>
              <option value="USA">United States</option>
              <option value="UK">United Kingdom</option>
              <option value="Canada">Canada</option>
              <option value="Australia">Australia</option>
            </select>
          </div>
        </div>
      </div>

      {/* Payment Details */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-gray-900">
            Payment Details
          </h3>
          <button
            onClick={() => onUpdate("Payment Details")}
            className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 text-sm font-medium"
          >
            Update
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Payment Method
            </label>
            <select
              value={settingsForm.paymentMethod}
              onChange={(e) =>
                setSettingsForm({
                  ...settingsForm,
                  paymentMethod: e.target.value,
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="PayPal">PayPal</option>
              <option value="Bank Transfer">Bank Transfer</option>
              <option value="Stripe">Stripe</option>
              <option value="Wire Transfer">Wire Transfer</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Payment Email / Account
            </label>
            <input
              type="text"
              value={settingsForm.paymentEmail}
              onChange={(e) =>
                setSettingsForm({
                  ...settingsForm,
                  paymentEmail: e.target.value,
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="payment@example.com"
            />
          </div>
        </div>

        <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> Payouts are processed on the 1st of each
            month for the previous month's earnings. Minimum payout threshold is
            ₹1,000.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function AffiliateDashboard() {
  const { user, loading: authLoading, logout } = useAuth();
  const [activePage, setActivePage] = useState("dashboard");

  // Initialize campaigns state with data from localStorage
  const [campaigns, setCampaigns] = useState<Campaign[]>(() => {
    try {
      const savedCampaigns = localStorage.getItem("refferq_campaigns");
      if (savedCampaigns) {
        const parsedCampaigns = JSON.parse(savedCampaigns);
        if (Array.isArray(parsedCampaigns)) {
          return parsedCampaigns.map((campaign: any) => ({
            id:
              campaign.id ||
              `campaign-${Math.random().toString(36).substr(2, 9)}`,
            campaignName: campaign.campaignName || "Unnamed Campaign",
            status: campaign.status || "Draft",
            revenue: Number(campaign.revenue) || 0,
            conversions: Number(campaign.conversions) || 0,
            ...campaign,
          }));
        }
      }
    } catch (error) {
      console.error("Error initializing campaigns:", error);
    }
    return []; // Default to empty array if there's an error or no data
  });

  // Set up storage event listener to sync changes across tabs
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "refferq_campaigns") {
        try {
          const newCampaigns = e.newValue ? JSON.parse(e.newValue) : [];
          if (Array.isArray(newCampaigns)) {
            setCampaigns(newCampaigns);
          }
        } catch (error) {
          console.error("Error parsing updated campaigns from storage:", error);
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  const [stats, setStats] = useState<AffiliateStats | null>(null);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Referral form state
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [submitForm, setSubmitForm] = useState({
    leadName: "",
    leadEmail: "",
    estimatedValue: "0",
  });

  // Settings form state
  const [settingsForm, setSettingsForm] = useState({
    name: "",
    phoneNumber: "",
    company: "",
    email: "",
    country: "",
    paymentMethod: "PayPal",
    paymentEmail: "",
  });

  useEffect(() => {
    if (!authLoading && user) {
      loadDashboardData();
    }
  }, [authLoading, user]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Get data from localStorage if available
      let localCampaigns = [];
      try {
        const campaignsData = localStorage.getItem("refferq_campaigns");
        localCampaigns = campaignsData ? JSON.parse(campaignsData) : [];

        // Ensure localCampaigns is an array
        if (!Array.isArray(localCampaigns)) {
          console.warn(
            "Invalid campaigns data in localStorage, resetting to empty array"
          );
          localCampaigns = [];
          localStorage.setItem("refferq_campaigns", JSON.stringify([]));
        }
      } catch (error) {
        console.error("Error parsing campaigns from localStorage:", error);
        localCampaigns = [];
        localStorage.setItem("refferq_campaigns", JSON.stringify([]));
      }

      const totalCampaigns = localCampaigns.length;
      const activeCampaigns = localCampaigns.filter(
        (campaign: any) =>
          campaign &&
          typeof campaign === "object" &&
          (campaign.status === "active" || campaign.status === "Active")
      ).length;

      // Generate a random referral code if not exists
      const referralCode =
        localStorage.getItem("referralCode") ||
        Math.random().toString(36).substring(2, 8).toUpperCase();

      if (!localStorage.getItem("referralCode")) {
        localStorage.setItem("referralCode", referralCode);
      }

      // Set default stats with local data
      setStats({
        totalEarnings: 0,
        totalClicks: 0,
        totalLeads: 0,
        totalReferredCustomers: 0,
        totalCampaigns: totalCampaigns,
        activeCampaigns: activeCampaigns,
        referralLink: `${window.location.origin}/r/${referralCode}`,
        referralCode: referralCode,
      });

      // Set empty referrals array
      setReferrals([]);

      // Set empty payouts array
      setPayouts([]);

      // Set user settings
      setSettingsForm({
        name: user?.name || "",
        phoneNumber: "",
        company: "",
        email: user?.email || "",
        country: "India",
        paymentMethod: "PayPal",
        paymentEmail: user?.email || "",
      });
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitLead = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch("/api/affiliate/referrals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lead_name: submitForm.leadName,
          lead_email: submitForm.leadEmail,
          estimated_value: submitForm.estimatedValue,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setNotification({
          type: "success",
          message: "Lead submitted successfully! Waiting for admin approval.",
        });
        setShowSubmitModal(false);
        setSubmitForm({ leadName: "", leadEmail: "", estimatedValue: "0" });
        loadDashboardData();
      } else {
        setNotification({
          type: "error",
          message: data.error || "Failed to submit lead",
        });
      }
    } catch (error) {
      setNotification({
        type: "error",
        message: "An error occurred while submitting lead",
      });
    }

    setTimeout(() => setNotification(null), 5000);
  };

  const handleUpdateSettings = async (field: string) => {
    try {
      // Save settings to localStorage
      const settingsKey = `affiliate_settings_${user?.id || "default"}`;
      localStorage.setItem(settingsKey, JSON.stringify(settingsForm));

      setNotification({
        type: "success",
        message: `${field} saved successfully!`,
      });
    } catch (error) {
      console.error("Error saving settings:", error);
      setNotification({
        type: "error",
        message: `Failed to save ${field}`,
      });
    } finally {
      setTimeout(() => setNotification(null), 5000);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-emerald-50/30 to-teal-50/30">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="relative">
            <div className="w-16 h-16 border-4 border-emerald-100 rounded-full"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-emerald-600 rounded-full animate-spin"></div>
          </div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mt-6 text-gray-600 font-medium"
          >
            Loading your dashboard...
          </motion.p>
        </motion.div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-emerald-50/30 to-teal-50/30">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center bg-white/80 backdrop-blur-xl p-10 rounded-3xl shadow-2xl shadow-gray-200/50 border border-gray-100/80"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
            className="w-20 h-20 bg-gradient-to-br from-red-100 to-rose-100 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg"
          >
            <span className="text-4xl">🔒</span>
          </motion.div>
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 mb-3">
            Access Denied
          </h1>
          <p className="text-gray-500">
            Affiliate account required to access this page
          </p>
          <motion.a
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            href="/login"
            className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-semibold shadow-lg shadow-emerald-500/30 hover:shadow-xl transition-shadow"
          >
            Go to Login
          </motion.a>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/20 to-teal-50/20">
      {/* Notification */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -20, x: 20 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-4 right-4 z-50 p-4 rounded-xl shadow-2xl border backdrop-blur-sm ${
              notification.type === "success"
                ? "bg-emerald-50/90 border-emerald-200 text-emerald-800"
                : "bg-red-50/90 border-red-200 text-red-800"
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  notification.type === "success"
                    ? "bg-emerald-100"
                    : "bg-red-100"
                }`}
              >
                <span>{notification.type === "success" ? "✓" : "⚠"}</span>
              </div>
              <span className="text-sm font-medium">
                {notification.message}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modern Sidebar */}
      <motion.div
        initial={{ x: -280 }}
        animate={{ x: 0 }}
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
        className="fixed left-0 top-0 h-full w-72 bg-white/90 backdrop-blur-2xl border-r border-gray-200/50 flex flex-col shadow-2xl shadow-gray-200/30 z-50"
      >
        {/* Logo Section */}
        <div className="p-6 border-b border-gray-100/80">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-3"
          >
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 via-white to-cyan-500 flex items-center justify-center shadow-xl shadow-emerald-500/40 animate-gradient">
              <span className="text-white text-xl">
                <Image
                  src="/refertle-logo.png"
                  alt="Refertle Logo"
                  width={120}
                  height={120}
                />
              </span>
            </div>
            <div>
              <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-teal-600">
                Refertle
              </h1>
              <p className="text-xs text-gray-500 font-medium">
                Affiliate Portal
              </p>
            </div>
          </motion.div>
        </div>

        {/* Quick Earnings Banner */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="mx-4 mt-4 p-4 bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 rounded-2xl shadow-lg shadow-emerald-500/30"
        >
          <div className="flex items-center justify-between text-white">
            <div>
              <p className="text-xs text-white/70 font-medium">
                Total Earnings
              </p>
              <p className="text-2xl font-bold">
                ₹{stats ? (stats.totalEarnings / 100).toFixed(0) : "0"}
              </p>
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <span className="text-2xl">💰</span>
            </div>
          </div>
        </motion.div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 mb-3">
            Main Menu
          </p>

          {[
            { id: "dashboard", label: "Dashboard", icon: "🏠" },
            { id: "campaigns", label: "Campaigns", icon: "📢" },
            { id: "rewards", label: "Rewards", icon: "💰" },
            { id: "resources", label: "Resources", icon: "📚" },
            { id: "payouts", label: "Payouts", icon: "💳" },
            { id: "reports", label: "Reports", icon: "📊", badge: "BETA" },
          ].map((item, index) => (
            <motion.button
              key={item.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * index }}
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActivePage(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl font-medium transition-all duration-200 ${
                activePage === item.id
                  ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/30"
                  : "text-gray-600 hover:bg-gray-100/80 hover:text-gray-900"
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="flex-1 text-left">{item.label}</span>
              {item.badge && (
                <span
                  className={`px-2 py-0.5 text-[10px] rounded-full font-bold ${
                    activePage === item.id
                      ? "bg-white/20 text-white"
                      : "bg-gradient-to-r from-blue-500 to-cyan-500 text-white"
                  }`}
                >
                  {item.badge}
                </span>
              )}
              {activePage === item.id && (
                <motion.div
                  layoutId="affiliate-nav-indicator"
                  className="w-2 h-2 rounded-full bg-white"
                />
              )}
            </motion.button>
          ))}

          <div className="my-6 border-t border-gray-200/50"></div>

          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 mb-3">
            Account
          </p>

          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            whileHover={{ x: 4 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setActivePage("settings")}
            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl font-medium transition-all duration-200 ${
              activePage === "settings"
                ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/30"
                : "text-gray-600 hover:bg-gray-100/80 hover:text-gray-900"
            }`}
          >
            <span className="text-xl">⚙️</span>
            <span>Settings</span>
          </motion.button>
        </nav>

        {/* User Profile Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="p-4 border-t border-gray-100/80"
        >
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-gray-50/80 hover:bg-gray-100/80 transition-all cursor-pointer group">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold shadow-lg shadow-emerald-500/30">
              {user.name?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-gray-900 truncate">
                {user.name}
              </div>
              <div className="text-xs text-gray-500 truncate">{user.email}</div>
            </div>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={logout}
              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
              title="Sign Out"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
            </motion.button>
          </div>
        </motion.div>
      </motion.div>

      {/* Main Content Area */}
      <div className="ml-72 p-8">
        {/* Top Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 via-gray-700 to-gray-600">
              Welcome back, {user.name?.split(" ")[0]}!
              <motion.span
                animate={{ rotate: [0, 15, -15, 0] }}
                transition={{ repeat: Infinity, duration: 2, repeatDelay: 3 }}
                className="inline-block ml-2"
              >
                👋
              </motion.span>
            </h1>
            <p className="text-gray-500 mt-1">
              Track your referrals and earnings
            </p>
          </div>
          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative p-3 text-gray-500 hover:text-emerald-600 bg-white hover:bg-emerald-50 rounded-xl transition-all shadow-sm border border-gray-100"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
            </motion.button>
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          {/* Dashboard Page */}
          {activePage === "dashboard" && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <DashboardPage
                stats={stats}
                referrals={referrals}
                campaigns={campaigns}
              />
            </motion.div>
          )}

          {activePage === "campaigns" && (
            <motion.div
              key="campaigns"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className=""
            >
              <div className="max-w-6xl mx-auto">
                <CampaignsTab
                  onSuccess={function (data: FormData): void {
                    throw new Error("Function not implemented.");
                  }}
                />
              </div>
            </motion.div>
          )}

          {/* Rewards Page */}
          {activePage === "rewards" && (
            <motion.div
              key="rewards"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <RewardsPage />
            </motion.div>
          )}

          {/* Payouts Page */}
          {activePage === "payouts" && (
            <motion.div
              key="payouts"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <PayoutsPage stats={stats} payouts={payouts} />
            </motion.div>
          )}

          {/* Settings Page */}
          {activePage === "settings" && (
            <motion.div
              key="settings"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <SettingsPage
                settingsForm={settingsForm}
                setSettingsForm={setSettingsForm}
                onUpdate={handleUpdateSettings}
              />
            </motion.div>
          )}

          {/* Other Pages */}
          {(activePage === "resources" || activePage === "reports") && (
            <motion.div
              key={activePage}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg shadow-gray-200/50 border border-gray-100 p-8">
                <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 mb-4">
                  {activePage.charAt(0).toUpperCase() + activePage.slice(1)}
                </h2>
                <p className="text-gray-600">
                  This section is under development. Check back soon for
                  updates!
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Submit Lead Modal */}
      <AnimatePresence>
        {showSubmitModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900">
                  Submit lead
                </h3>
                <button
                  onClick={() => setShowSubmitModal(false)}
                  className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-700 transition-all"
                >
                  <span className="text-xl">&times;</span>
                </button>
              </div>

              <p className="text-sm text-gray-500 mb-8">
                Enter the details below to submit a lead. Ensure all information
                is accurate for proper tracking and follow-up.
              </p>

              <form onSubmit={handleSubmitLead} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    What's the lead's name?*
                  </label>
                  <input
                    type="text"
                    required
                    value={submitForm.leadName}
                    onChange={(e) =>
                      setSubmitForm({ ...submitForm, leadName: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none"
                    placeholder="Full name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    What is the main contact's email address?*
                  </label>
                  <input
                    type="email"
                    required
                    value={submitForm.leadEmail}
                    onChange={(e) =>
                      setSubmitForm({
                        ...submitForm,
                        leadEmail: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none"
                    placeholder="email@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    What is the estimated deal size for this lead? (Type 0 if
                    unsure)*
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-3.5 text-gray-400 font-medium">
                      ₹
                    </span>
                    <input
                      type="number"
                      required
                      value={submitForm.estimatedValue}
                      onChange={(e) =>
                        setSubmitForm({
                          ...submitForm,
                          estimatedValue: e.target.value,
                        })
                      }
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none"
                      placeholder="0"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl hover:shadow-lg hover:shadow-emerald-500/30 font-semibold transition-all duration-300"
                >
                  Submit lead
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
