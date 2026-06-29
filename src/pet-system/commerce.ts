import { products } from "./config";
import type { CompanionData, Entitlement, EntitlementKind } from "./types";

export type PaymentResult = {
  ok: boolean;
  productId: string;
  transactionId?: string;
  error?: string;
};

export interface PaymentProvider {
  purchase(productId: string): Promise<PaymentResult>;
  restore(): Promise<PaymentResult[]>;
}

export class MockPaymentProvider implements PaymentProvider {
  async purchase(productId: string): Promise<PaymentResult> {
    return { ok: true, productId, transactionId: `mock_${Date.now()}` };
  }

  async restore(): Promise<PaymentResult[]> {
    return [];
  }
}

export function signEntitlement(kind: EntitlementKind, source: Entitlement["source"], grantedAt: string) {
  return btoa(`${kind}:${source}:${grantedAt}:pixelpal-local-v1`);
}

export function verifyEntitlement(entitlement: Entitlement) {
  return entitlement.signature === signEntitlement(entitlement.kind, entitlement.source, entitlement.grantedAt);
}

export function hasEntitlement(data: CompanionData, kind: EntitlementKind) {
  if (kind === "free") return true;
  return data.entitlements.some((entitlement) => entitlement.kind === kind && verifyEntitlement(entitlement) && (!entitlement.expiresAt || Date.now() < new Date(entitlement.expiresAt).getTime()));
}

export function grantMockEntitlement(data: CompanionData, productId: string) {
  const product = products.find((item) => item.productId === productId);
  if (!product || product.entitlementKind === "free") return data;
  const grantedAt = new Date().toISOString();
  const entitlement: Entitlement = {
    entitlementId: `${product.entitlementKind}_${productId}`,
    kind: product.entitlementKind as EntitlementKind,
    source: "mock",
    grantedAt,
    signature: signEntitlement(product.entitlementKind as EntitlementKind, "mock", grantedAt),
  };
  return {
    ...data,
    entitlements: [...data.entitlements.filter((item) => item.entitlementId !== entitlement.entitlementId), entitlement],
  };
}

export function purchaseServiceNote() {
  return "当前仅提供 MockPaymentProvider 开发接口；正式支付、激活码或许可证验证未接入，正式环境不会显示免费解锁入口。";
}

