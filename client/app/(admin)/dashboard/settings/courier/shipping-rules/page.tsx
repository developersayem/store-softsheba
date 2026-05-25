"use client";

import { useState, useCallback, useMemo } from "react";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import LoadingCom from "@/components/shared/loading-com";
import { IShippingRule } from "@/types/shipping_rule.type";
import { ShippingRulesTable } from "@/components/dashboard/settings/courier/shipping-rules/shipping-rule-table";
import { EditShippingRuleModal } from "@/components/dashboard/settings/courier/shipping-rules/edit-shipping-rule-modal";

const ShippingRulesPage = () => {
  const [editOpen, setEditOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<IShippingRule | null>(null);

  // Fetch shipping rules
  const {
    data: rulesRes,
    isLoading,
    mutate: mutateShippingRules,
  } = useSWR<{ data: IShippingRule[] }>("/shipping-rules", fetcher);
  const shippingRules = useMemo(() => rulesRes?.data || [], [rulesRes?.data]);

  const handleEditRule = useCallback((rule: IShippingRule) => {
    setEditingRule(rule);
    setEditOpen(true);
  }, []);

  const handleCloseEditModal = useCallback(() => {
    setEditOpen(false);
    setEditingRule(null);
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <h1 className="text-2xl font-bold">Shipping Rules</h1>
      </div>

      {/* Table */}
      {isLoading ? (
        <LoadingCom displayText="Loading" />
      ) : (
        <ShippingRulesTable
          shippingRules={shippingRules}
          onEdit={handleEditRule}
          mutateShippingRulesData={mutateShippingRules}
          className="w-full"
        />
      )}

      {/* Edit modal */}
      <EditShippingRuleModal
        open={editOpen}
        onClose={handleCloseEditModal}
        shippingRule={editingRule}
        mutateShippingRulesData={mutateShippingRules}
      />
    </div>
  );
};

export default ShippingRulesPage;
