export const AccountProviderEnum = {
    GOOGLE: "GOOGLE",
    EMAIL: "EMAIL",
} as const;

export const AuthStrategyEnum = AccountProviderEnum;

export type TAccountProviderEnum = (typeof AccountProviderEnum)[keyof typeof AccountProviderEnum];
export type TAuthStrategyEnum = (typeof AuthStrategyEnum)[keyof typeof AuthStrategyEnum];
