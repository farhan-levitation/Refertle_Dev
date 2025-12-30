"use client";
import { useState, useEffect } from "react";
import { CampaignForm, FormData } from "@/components/campaign";

// Helper function to format dates as YYYY-MM-DD
const formatDate = (dateString?: string): string => {
  if (!dateString) return "X";
  try {
    const date = new Date(dateString);
    return date.toISOString().split("T")[0];
  } catch (error) {
    console.error("Error formatting date:", error);
    return "Invalid Date";
  }
};
import { Button } from "@/components/ui/button";
import { AnimatePresence } from "framer-motion";
import { MoreVertical, Eye, Edit, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";

function getRewardTypeText(rewardRecipients: string) {
  if (rewardRecipients === "both") return "Referrer & Referred";
  if (rewardRecipients === "referrer") return "Referrer";
  if (rewardRecipients === "referred") return "Referred";
  return "-";
}

interface CampaignFormProps {
  onSuccess: (data: FormData) => void;
  initialData?: FormData | null; // Make it optional with ?
}

export default function CampaignsTab({
  onSuccess,
  initialData,
}: CampaignFormProps) {
  const [campaigns, setCampaigns] = useState<FormData[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [viewingCampaign, setViewingCampaign] = useState<FormData | null>(null);
  const [editingCampaign, setEditingCampaign] = useState<FormData | null>(null);

  // Fetch campaigns from API when component mounts
  useEffect(() => {
    const fetchCampaigns = async () => {
      const apiUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/campaigns?shop=${process.env.NEXT_PUBLIC_SHOP_NAME}`;

      try {
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error("Failed to fetch campaigns");
        const data = await response.json();
        setCampaigns(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error fetching campaigns:", error);
      }
    };

    fetchCampaigns();
  }, []);

  // const addCampaign = async (data: FormData) => {
  //   try {
  //     const response = await fetch(
  //       "http://localhost:4000/api/campaigns/?shop=jindaal-2.myshopify.com",
  //       {
  //         method: "POST",
  //         headers: { "Content-Type": "application/json" },
  //         body: JSON.stringify(data),
  //       }
  //     );

  //     if (!response.ok) throw new Error("Failed to add campaign");

  //     const newCampaign = await response.json();
  //     setCampaigns((prev) => [...prev, newCampaign]);
  //     setShowForm(false);
  //   } catch (error) {
  //     console.error("Error adding campaign:", error);
  //   }
  // };

  // const updateCampaign = async (updatedCampaign: FormData) => {
  //   try {
  //     const response = await fetch(
  //       `http://localhost:4000/api/campaigns/${updatedCampaign.id}?shop=jindaal-2.myshopify.com`,
  //       {
  //         method: "PUT",
  //         headers: { "Content-Type": "application/json" },
  //         body: JSON.stringify(updatedCampaign),
  //       }
  //     );

  //     if (!response.ok) throw new Error("Failed to update campaign");

  //     const updatedData = await response.json();
  //     setCampaigns((prev) =>
  //       prev.map((c) => (c.id === updatedCampaign.id ? updatedData : c))
  //     );
  //     setShowForm(false);
  //     setEditingCampaign(null);
  //   } catch (error) {
  //     console.error("Error updating campaign:", error);
  //   }
  // };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Campaigns</h1>
        <Button
          onClick={() => {
            setEditingCampaign(null);
            setShowForm(true);
          }}
          className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 rounded-3xl"
        >
          <Link href="/affiliate/createCampaign">Create Campaign</Link>
        </Button>
      </div>
      {campaigns.length === 0 ? (
        <div className="text-center py-14">
          <div className="mx-auto w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 text-blue-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            No campaigns yet
          </h2>
          <p className="text-gray-500 mb-6">
            Get started by creating your first campaign
          </p>
          <Button onClick={() => setShowForm(true)}>Create Campaign</Button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Campaigns' Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reward Pending
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reward Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Revenue
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Conversions
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {campaigns.map((campaign) => (
                <tr key={campaign.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {campaign.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatDate(campaign.start_date)} -{" "}
                        {formatDate(campaign.end_date)}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        campaign.status === "active"
                          ? "bg-green-100 text-green-800"
                          : campaign.status === "draft"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                      }`}
                    >
                      {campaign.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                    {campaign.rewardPending || "0"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {campaign.reward_type}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                    ₹0.00
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                    0
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button className="relative bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 rounded-3xl h-8 w-8 p-0 flex items-center justify-center hover:opacity-90">
                          <MoreVertical className="h-4 w-4 text-white absolute" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => setViewingCampaign(campaign)}
                          className="cursor-pointer"
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          View
                        </DropdownMenuItem>
                        {/* <DropdownMenuItem
                            onClick={() => {
                              // Set the campaign to edit
                              setViewingCampaign(campaign);
                              // You'll need to implement the edit functionality
                              // This might involve setting a state to track edit mode
                              // and pre-filling the form with the campaign data
                              setShowForm(true);
                            }}
                            className="cursor-pointer"
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem> */}
                        <DropdownMenuItem
                          onClick={async () => {
                            if (
                              confirm(
                                "Are you sure you want to delete this campaign?"
                              )
                            ) {
                              try {
                                const apiUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/campaigns/${campaign.id}?shop=${process.env.NEXT_PUBLIC_SHOP_NAME}`;
                                const response = await fetch(apiUrl, {
                                  method: "DELETE",
                                });

                                if (!response.ok) {
                                  throw new Error("Failed to delete campaign");
                                }

                                // Update local state to remove the deleted campaign
                                setCampaigns((prevCampaigns) =>
                                  prevCampaigns.filter(
                                    (c) => c.id !== campaign.id
                                  )
                                );
                              } catch (error) {
                                console.error(
                                  "Error deleting campaign:",
                                  error
                                );
                                alert(
                                  "Failed to delete campaign. Please try again."
                                );
                              }
                            }
                          }}
                          className="cursor-pointer text-red-600 hover:!text-red-600"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <AnimatePresence>
        {viewingCampaign && (
          <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl p-10 w-full max-w-2xl relative animate-fadeIn max-h-[90vh] overflow-y-auto">
              <button
                className="absolute top-3 right-4 text-xl text-gray-400 hover:text-gray-700"
                onClick={() => setViewingCampaign(null)}
              >
                &times;
              </button>
              <h2 className="text-2xl font-bold mb-6">
                Campaign Details - Review
              </h2>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-2">Campaign Name</h3>
                  <p>{viewingCampaign.campaignName}</p>
                </div>
                <div>
                  <h3 className="text-lg font-medium mb-2">Status</h3>
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      viewingCampaign.status === "active"
                        ? "bg-green-100 text-green-800"
                        : viewingCampaign.status === "draft"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                    }`}
                  >
                    {viewingCampaign.status}
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-medium mb-2">Reward Type</h3>
                  <p>{viewingCampaign.rewardType}</p>
                </div>
                <div>
                  <h3 className="text-lg font-medium mb-2">Duration</h3>
                  <p>
                    {new Date(viewingCampaign.startDate).toLocaleDateString()} -{" "}
                    {viewingCampaign.endDate
                      ? new Date(viewingCampaign.endDate).toLocaleDateString()
                      : "No end date"}
                  </p>
                </div>
                {viewingCampaign.minOrderValue !== undefined && (
                  <div>
                    <h3 className="text-lg font-medium mb-2">
                      Minimum Order Value
                    </h3>
                    <p>${viewingCampaign.minOrderValue?.toFixed(2)}</p>
                  </div>
                )}
                <div>
                  <h3 className="text-lg font-medium mb-2">
                    Eligible Products
                  </h3>
                  <p>
                    {!viewingCampaign.eligibleProducts?.length
                      ? "All Products"
                      : viewingCampaign.eligibleProducts
                          .map((p: string) => {
                            if (p === "all") return "All Products";
                            if (p.startsWith("category:"))
                              return (
                                p.split(":")[1].charAt(0).toUpperCase() +
                                p.split(":")[1].slice(1)
                              );
                            return p;
                          })
                          .join(", ")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
        {/* {showForm && (
          <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl p-10 w-full max-w-2xl relative animate-fadeIn">
              <button
                className="absolute top-3 right-4 text-xl text-gray-400 hover:text-gray-700"
                onClick={() => setShowForm(false)}
              >
                &times;
              </button>
              <h2 className="text-2xl font-bold mb-6">Create Campaign</h2>
              <CampaignForm
                onSuccess={editingCampaign ? updateCampaign : addCampaign}
                initialData={editingCampaign}
              />{" "}
            </div>
          </div>
        )} */}
      </AnimatePresence>
    </div>
  );
}
