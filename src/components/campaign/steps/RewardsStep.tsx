import { FormData } from "../CampaignForm";

type RewardsStepProps = {
  formData: FormData;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => void;
};
const rewardTypeOptions = [
  { value: "cashback", label: "Cashback" },
  { value: "wallet", label: "Wallet" },
  { value: "rewardPoints", label: "Reward Points" },
];

export default function RewardsStep({ formData, onChange }: RewardsStepProps) {
  const handleRecipientChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value as "both" | "referrer" | "referred";
    onChange({
      target: {
        name: "rewardRecipients",
        value,
      },
    } as React.ChangeEvent<HTMLInputElement>);
  };

  const handleRewardRecipientChange = (
    type: "referrer" | "referred",
    value: string
  ) => {
    onChange({
      target: {
        name: `${type}RewardType`,
        value,
      },
    } as React.ChangeEvent<HTMLInputElement>);
  };

  const handleRewardValueChange = (
    type: "referrer" | "referred",
    value: string
  ) => {
    onChange({
      target: {
        name: `${type}RewardValue`,
        value: parseFloat(value) || 0,
      },
    } as unknown as React.ChangeEvent<HTMLInputElement>);
  };

  const handleRewardTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange({
      target: {
        name: "rewardType",
        value: e.target.value,
      },
    } as React.ChangeEvent<HTMLSelectElement>);
  };

  return (
    <div className="space-y-2">
      <h2 className="text-xl font-semibold">Rewards</h2>

      <div className="space-y-4">
        <div className="space-y-4">
          <div>
            <label
              htmlFor="rewardType"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Reward Type
            </label>
            <select
              id="rewardType"
              name="rewardType"
              value={formData.rewardType || ""}
              onChange={handleRewardTypeChange}
              className="mt-1 border block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm rounded-md"
            >
              <option value="">Select reward type</option>
              {rewardTypeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-3">
            Who gets rewards?
          </h3>
          <div className="space-x-2 flex items-center">
            {[
              { id: "both", label: "Both " },
              { id: "referrer", label: "Only referrer" },
              { id: "referred", label: "Only referred user" },
            ].map((option) => (
              <div
                key={option.id}
                className="flex items-center bg-[#F6F6F6] p-2 rounded-md"
              >
                <label
                  htmlFor={`recipient-${option.id}`}
                  className="mr-2 block text-sm text-gray-700"
                >
                  {option.label}
                </label>
                <input
                  id={`recipient-${option.id}`}
                  name="rewardRecipients"
                  type="radio"
                  value={option.id}
                  checked={formData.rewardRecipients === option.id}
                  onChange={handleRecipientChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center space-x-8">
          {(formData.rewardRecipients === "both" ||
            formData.rewardRecipients === "referrer") && (
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-700">
                Rewards for referrer
              </h3>
              <div className="flex items-center space-x-2">
                <div className="flex items-center bg-[#F6F6F6] p-2 rounded-md">
                  <label
                    htmlFor="referrer-fixed"
                    className="mr-2 block text-sm text-gray-700"
                  >
                    Fixed
                  </label>
                  <input
                    id="referrer-fixed"
                    name="referrerRewardType"
                    type="radio"
                    value="fixed"
                    checked={formData.referrerRewardType === "fixed"}
                    onChange={() =>
                      handleRewardRecipientChange("referrer", "fixed")
                    }
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                </div>
                <div className="flex items-center bg-[#F6F6F6] p-2 rounded-md">
                  <label
                    htmlFor="referrer-percentage"
                    className="mr-2 block text-sm text-gray-700"
                  >
                    Percentage %
                  </label>
                  <input
                    id="referrer-percentage"
                    name="referrerRewardType"
                    type="radio"
                    value="percentage"
                    checked={formData.referrerRewardType === "percentage"}
                    onChange={() =>
                      handleRewardRecipientChange("referrer", "percentage")
                    }
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                </div>
              </div>
              <div>
                <input
                  type="number"
                  min="0"
                  step={
                    formData.referrerRewardType === "percentage" ? "0.1" : "1"
                  }
                  value={formData.referrerRewardValue}
                  onChange={(e) =>
                    handleRewardValueChange("referrer", e.target.value)
                  }
                  className="mt-1 block w-full rounded-md border p-2 border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  placeholder="0.00"
                />
              </div>
            </div>
          )}

          {(formData.rewardRecipients === "both" ||
            formData.rewardRecipients === "referred") && (
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-700">
                Rewards for referred user
              </h3>
              <div className="flex items-center space-x-4">
                <div className="flex items-center bg-[#F6F6F6] p-2 rounded-md">
                  <label
                    htmlFor="referred-fixed"
                    className="mr-2 block text-sm text-gray-700"
                  >
                    Fixed
                  </label>
                  <input
                    id="referred-fixed"
                    name="referredRewardType"
                    type="radio"
                    value="fixed"
                    checked={formData.referredRewardType === "fixed"}
                    onChange={() =>
                      handleRewardRecipientChange("referred", "fixed")
                    }
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                </div>
                <div className="flex items-center bg-[#F6F6F6] p-2 rounded-md">
                  <label
                    htmlFor="referred-percentage"
                    className="mr-2 block text-sm text-gray-700"
                  >
                    Percentage %
                  </label>
                  <input
                    id="referred-percentage"
                    name="referredRewardType"
                    type="radio"
                    value="percentage"
                    checked={formData.referredRewardType === "percentage"}
                    onChange={() =>
                      handleRewardRecipientChange("referred", "percentage")
                    }
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                </div>
              </div>
              <div>
                <input
                  type="number"
                  min="0"
                  step={
                    formData.referredRewardType === "percentage" ? "0.1" : "1"
                  }
                  value={formData.referredRewardValue}
                  onChange={(e) =>
                    handleRewardValueChange("referred", e.target.value)
                  }
                  className="mt-1 block w-full rounded-md border p-2 border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  placeholder="0.00"
                />
              </div>
            </div>
          )}
        </div>

        <div className="p-4 border rounded-lg bg-blue-50">
          <h3 className="text-sm font-medium text-gray-700 mb-2">
            Customer sees:
          </h3>
          <p className="text-sm text-gray-600">
            {formData.rewardRecipients === "both" &&
              `Get ₹${formData.referrerRewardValue} when your friend makes a purchase, and your friend gets ₹${formData.referredRewardValue} off their first order.`}
            {formData.rewardRecipients === "referrer" &&
              `Earn ₹${formData.referrerRewardValue} for every friend who makes a purchase.`}
            {formData.rewardRecipients === "referred" &&
              `Your friend gets ₹${formData.referredRewardValue} off their first purchase.`}
          </p>
        </div>
      </div>
    </div>
  );
}
