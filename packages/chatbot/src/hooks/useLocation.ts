import { useEffect, useState } from "react";

interface LocationResp {
  status?: string;
  country?: string;
  countryCode?: string;
  state?: string;
  stateName?: string;
  region?: string;
  regionName?: string;
  city?: string;
}

export const useLocation = () => {
  const [locationData, setLocationData] = useState<{
    location: LocationResp | null;
    loading: boolean;
  }>({
    location: null,
    loading: true,
  });

  useEffect(() => {
    const fetchLocation = async () => {
      try {
        const ipAddress = await getIpAddress();
        if (!ipAddress) {
          setLocationData({
            location: null,
            loading: false,
          });
          return;
        }

        const location = await getLocation(ipAddress);
        if (!location) {
          setLocationData({
            location: null,
            loading: false,
          });
          return;
        }

        setLocationData({ location, loading: false });
      } catch (error) {
        console.error(error);
        setLocationData({
          location: null,
          loading: false,
        });
      }
    };

    fetchLocation();
  }, []);

  useEffect(() => {
    if (locationData.location) {
      localStorage.setItem("location", JSON.stringify(locationData.location));
    }
  }, [locationData.location]);

  return { location: locationData.location, loading: locationData.loading };
};

const getIpAddress = async () => {
  try {
    const apiUrl = "https://api.ipify.org";
    const req = await fetch(apiUrl);
    const resp = await req.text();

    if (req.status !== 200) {
      console.error("Failed to fetch IP address");
      return null;
    }

    return resp;
  } catch (e: any) {
    console.error(e);
    return null;
  }
};

const getLocation = async (ip: string) => {
  try {
    const url = `https://ip-api.com/json/${ip}?fields=status,country,countryCode,region,regionName,city`;
    const req = await fetch(url);
    const resp = await req.json();

    if (req.status !== 200) {
      throw new Error("Failed to fetch location");
    }

    return {
      country: resp.country,
      countryCode: resp.countryCode,
      state: resp.regionName,
      city: resp.city,
    } as LocationResp;
  } catch (e: any) {
    return null;
  }
};
