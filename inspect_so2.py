import xarray as xr
import matplotlib.pyplot as plt
import cartopy.crs as ccrs

FILEPATH = r"S5P_NRTI_L2__SO2____20250705T064145_20250705T064645_40035_03_020701_20250705T071829.nc"
GROUP    = "PRODUCT"
VAR      = "sulfurdioxide_total_vertical_column"   # change if your printout shows a different name
QA_VAR   = "qa_value"                              # typical quality flag; adjust if needed

# 1) open science group
ds  = xr.open_dataset(FILEPATH, group=GROUP, engine="netcdf4")

# 2) select the first (and only) time slice
da  = ds[VAR].isel(time=0)
lat = ds["latitude"].isel(time=0)
lon = ds["longitude"].isel(time=0)

# 3) optional QA screen: keep pixels with qa > 0.5
if QA_VAR in ds:
    qa = ds[QA_VAR].isel(time=0)
    da = da.where(qa > 0.5)

# 4) make a map
fig = plt.figure(figsize=(10, 5))
ax  = plt.axes(projection=ccrs.PlateCarree())
pm  = ax.pcolormesh(
        lon, lat, da,
        transform=ccrs.PlateCarree(),
        cmap="RdBu_r",
        shading="auto"
      )
ax.coastlines()
cb = plt.colorbar(pm, orientation="vertical", pad=0.02)
cb.set_label("SO₂ column [mol m⁻²]")
plt.title(f"Sentinel‑5P SO₂   {str(ds.time.values[0])[:10]}")
plt.tight_layout()
plt.show()
