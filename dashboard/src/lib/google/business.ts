// API Google Business Profile — nécessite les API "My Business Account
// Management API" et "My Business Business Information API" activées sur
// le projet Google Cloud (menu "API et services" > "Bibliothèque").
const ACCOUNT_MANAGEMENT_BASE_URL =
  "https://mybusinessaccountmanagement.googleapis.com/v1";
const BUSINESS_INFORMATION_BASE_URL =
  "https://mybusinessbusinessinformation.googleapis.com/v1";

export type GoogleAccount = {
  name: string; // ex: "accounts/1234567890"
  accountName: string;
};

export async function listAccounts(
  accessToken: string,
): Promise<GoogleAccount[]> {
  const res = await fetch(`${ACCOUNT_MANAGEMENT_BASE_URL}/accounts`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    throw new Error(`Google accounts.list a échoué : ${res.status} ${await res.text()}`);
  }

  const data = (await res.json()) as {
    accounts?: { name: string; accountName: string }[];
  };

  return (data.accounts ?? []).map((a) => ({
    name: a.name,
    accountName: a.accountName,
  }));
}

export type GoogleLocation = {
  name: string; // ex: "accounts/1234567890/locations/9876543210"
  title: string;
  address: string | null;
};

export async function listLocations(
  accessToken: string,
  accountName: string,
): Promise<GoogleLocation[]> {
  const url = new URL(`${BUSINESS_INFORMATION_BASE_URL}/${accountName}/locations`);
  url.searchParams.set("readMask", "name,title,storefrontAddress");

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    throw new Error(`Google locations.list a échoué : ${res.status} ${await res.text()}`);
  }

  const data = (await res.json()) as {
    locations?: {
      name: string;
      title: string;
      storefrontAddress?: { addressLines?: string[]; locality?: string };
    }[];
  };

  return (data.locations ?? []).map((l) => ({
    name: l.name,
    title: l.title,
    address: l.storefrontAddress
      ? [...(l.storefrontAddress.addressLines ?? []), l.storefrontAddress.locality]
          .filter(Boolean)
          .join(", ")
      : null,
  }));
}
