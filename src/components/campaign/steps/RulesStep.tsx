import { FormData } from "../CampaignForm";

type RulesStepProps = {
  formData: FormData;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => void;
};

export default function RulesStep({ formData, onChange }: RulesStepProps) {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Rules</h2>

      <div className="space-y-6">
        <div>
          <label
            htmlFor="rewardExpiryDays"
            className="block text-sm font-medium text-gray-700"
          >
            Reward Expires In (days)
          </label>
          <input
            type="number"
            name="rewardExpiryDays"
            id="rewardExpiryDays"
            min="1"
            value={formData.rewardExpiryDays}
            onChange={onChange}
            className="mt-1 block border p-2 w-1/3 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
          <p className="mt-2 text-sm text-gray-500">
            Number of days after which the reward will expire if not used.
          </p>
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-3">
            Reward Issuance
          </h3>
          <div className="space-x-3 flex items-center">
            <div className="flex items-center bg-[#F6F6F6] p-2 rounded-md">
              <input
                id="after-completion"
                name="rewardIssuance"
                type="radio"
                value="after_completion"
                checked={formData.rewardIssuance === "after_completion"}
                onChange={onChange}
                className="h-4 w-4  text-blue-600 focus:ring-blue-500 border-gray-300"
              />
              <label
                htmlFor="after-completion"
                className="ml-2 block text-sm text-gray-700"
              >
                After completion window
              </label>
            </div>

            <div className="flex items-center bg-[#F6F6F6] p-2 rounded-md">
              <input
                id="instant"
                name="rewardIssuance"
                type="radio"
                value="instant"
                checked={formData.rewardIssuance === "instant"}
                onChange={onChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
              />
              <label
                htmlFor="instant"
                className="ml-2 block text-sm text-gray-700"
              >
                Instant
              </label>
            </div>

            <div className="flex items-center bg-[#F6F6F6] p-2 rounded-md">
              <input
                id="after-x-days"
                name="rewardIssuance"
                type="radio"
                value="after_x_days"
                checked={formData.rewardIssuance === "after_x_days"}
                onChange={onChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
              />
              <div className="ml-2 flex items-center">
                <label
                  htmlFor="after-x-days"
                  className="block text-sm text-gray-700 mr-2"
                >
                  After
                </label>
                <input
                  type="number"
                  name="rewardIssuanceDays"
                  min="1"
                  value={formData.rewardIssuanceDays}
                  onChange={onChange}
                  disabled={formData.rewardIssuance !== "after_x_days"}
                  className="block w-16 rounded-sm bg-white px-2 border border-gray-900 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
                <span className="ml-2 text-sm text-gray-700">days</span>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-3">
            Returns & Cancellation
          </h3>
          <div className="space-x-2 flex items-center">
            <div className="flex items-center bg-[#F6F6F6] p-2 rounded-md">
              <input
                id="void-reward"
                name="returnPolicy"
                type="radio"
                value="void"
                checked={formData.returnPolicy === "void"}
                onChange={onChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
              />
              <label
                htmlFor="void-reward"
                className="ml-2 block text-sm text-gray-700"
              >
                Void reward on return
              </label>
            </div>
            <div className="flex items-center bg-[#F6F6F6] p-2 rounded-md">
              <input
                id="hold-reward"
                name="returnPolicy"
                type="radio"
                value="hold"
                checked={formData.returnPolicy === "hold"}
                onChange={onChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
              />
              <label
                htmlFor="hold-reward"
                className="ml-2 block text-sm text-gray-700"
              >
                Hold reward until return window ends
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
