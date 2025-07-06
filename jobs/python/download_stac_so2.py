import requests
import pathlib

# 🔁 Replace these with your own CDSE credentials
CDSE_USERNAME = "rohitbedwal09@gmail.com"
CDSE_PASSWORD = "8zTa&2mghh/P%e7"
FILENAME = "S5P_NRTI_L2__SO2____20250705T064145_20250705T064645_40035_03_020701_20250705T071829.nc"
PRODUCT_ID = "a60b6659-6751-422f-b189-059c5fb68fe3"

# 1. Get an access token from CDSE
def get_access_token(username, password):
    auth_url = "https://identity.dataspace.copernicus.eu/auth/realms/CDSE/protocol/openid-connect/token"
    payload = {
        "client_id": "cdse-public",
        "grant_type": "password",
        "username": username,
        "password": password
    }
    headers = {"Content-Type": "application/x-www-form-urlencoded"}

    r = requests.post(auth_url, data=payload, headers=headers)
    r.raise_for_status()
    return r.json()["access_token"]

print("🔐 Getting token...")
access_token = get_access_token(CDSE_USERNAME, CDSE_PASSWORD)
print("✅ Token received")

# 2. Build the download URL using the product ID and file name
zipper_url = (
    f"https://zipper.dataspace.copernicus.eu/odata/v1/"
    f"Products({PRODUCT_ID})/Nodes({FILENAME})/$value"
)

# 3. Download the file
print(f"⤓ Downloading: {FILENAME}")
headers = {"Authorization": f"Bearer {access_token}"}

with requests.get(zipper_url, headers=headers, stream=True) as r:
    r.raise_for_status()
    with open(FILENAME, "wb") as f:
        for chunk in r.iter_content(8192):
            f.write(chunk)

print(f"✅ Downloaded: {FILENAME}")


