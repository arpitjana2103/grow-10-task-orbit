export const AccountProviderEnum = {
    GOOGLE: "GOOGLE",
    EMAIL: "EMAIL",
} as const;

export const AuthStrategyEnum = AccountProviderEnum;

export type T_AccountProviderEnum = (typeof AccountProviderEnum)[keyof typeof AccountProviderEnum];
export type T_AuthStrategyEnum = (typeof AuthStrategyEnum)[keyof typeof AuthStrategyEnum];
