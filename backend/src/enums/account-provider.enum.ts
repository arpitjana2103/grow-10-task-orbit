export const AccountProviderEnum = {
    GOOGLE: "GOOGLE",
    EMAIL: "EMAIL",
};

export type T_AccountProviderEnum = (typeof AccountProviderEnum)[keyof typeof AccountProviderEnum];
