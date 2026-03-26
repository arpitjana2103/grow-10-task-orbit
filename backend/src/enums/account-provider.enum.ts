export const AccountProviderEnum = {
    GOOGLE: "GOOGLE",
    GITHUB: "GITHUB",
    FACEBOOK: "FACEBOOK",
    EMAIL: "EMAIL",
};

export type T_AccountProviderEnum = (typeof AccountProviderEnum)[keyof typeof AccountProviderEnum];
