#!/usr/bin/env python3
"""
Sentinel‑5P SO₂ quick‑look + GeoTIFF export
───────────────────────────────────────────
• Reads PRODUCT group from an L2 SO₂ NetCDF
• QA screens, plots, saves PNG
• Re‑bins to 0.1° grid and writes GeoTIFF

Author: <you>
"""

import os
import datetime as dt
import numpy as np
import xarray as xr
import matplotlib.pyplot as plt
import cartopy.crs as ccrs
import cartopy.feature as cfeature
import rioxarray  # noqa: F401 – adds .rio accessor
import pandas as pd

# ───────────── CONFIG ─────────────────────────────────────────────────────────
FILEPATH = (
    r"S5P_NRTI_L2__SO2____20250705T064145_20250705T064645_40035_03_020701_20250705T071829.nc"
)

GROUP         = "PRODUCT"
SO2_VAR       = "sulfurdioxide_total_vertical_column"  # adjust if needed
QA_VAR        = "qa_value"                            # adjust if needed
QA_THRESHOLD  = 0.5

# Map options
LON_MIN, LON_MAX = 68, 97   # India box
LAT_MIN, LAT_MAX = 6, 37

# Grid options
GRID_RES = 0.1  # degrees

# ───────────── 1. READ PRODUCT GROUP ──────────────────────────────────────────
ds = xr.open_dataset(FILEPATH, group=GROUP, engine="netcdf4")
time_str = str(ds.time.values[0])[:10]  # e.g. '2025-07-05'

# ───────────── 2. EXTRACT + QA FILTER ────────────────────────────────────────
so2 = ds[SO2_VAR].isel(time=0)
lat = ds["latitude"].isel(time=0)
lon = ds["longitude"].isel(time=0)

if QA_VAR in ds:
    qa  = ds[QA_VAR].isel(time=0)
    so2 = so2.where(qa >= QA_THRESHOLD)

# ───────────── 3. PLOT & SAVE PNG ─────────────────────────────────────────────
fig = plt.figure(figsize=(10, 5))
ax  = plt.axes(projection=ccrs.PlateCarree())
pm  = ax.pcolormesh(
        lon, lat, so2,
        transform=ccrs.PlateCarree(),
        cmap="RdBu_r",
        shading="auto",
        vmin=-0.002, vmax=0.002          # tweak colour stretch
      )
ax.coastlines(linewidth=0.6)
ax.add_feature(cfeature.BORDERS, linewidth=0.4)
ax.set_extent([LON_MIN, LON_MAX, LAT_MIN, LAT_MAX], ccrs.PlateCarree())
cb = plt.colorbar(pm, ax=ax, orientation="vertical", pad=0.02)
cb.set_label("SO₂ column [mol m⁻²]")
plt.title(f"Sentinel‑5P SO₂   {time_str}")
plt.tight_layout()

png_name = f"so2_map_{time_str.replace('-', '')}.png"
plt.savefig(png_name, dpi=300)
plt.close()
print(f"✓ Saved PNG → {png_name}")

# ───────────── 4. RE‑GRID TO 0.1° GRID ───────────────────────────────────────
#   Method: groupby_bins + mean
lat_bins = np.arange(LAT_MIN, LAT_MAX + GRID_RES, GRID_RES)
lon_bins = np.arange(LON_MIN, LON_MAX + GRID_RES, GRID_RES)

df = so2.to_dataframe(name="so2").reset_index()  # long‑form table
# drop NaNs (missing pixels filtered by QA)
df = df.dropna(subset=["so2", "latitude", "longitude"])

# assign bin labels
df["lat_bin"] = pd.cut(df["latitude"], lat_bins, labels=lat_bins[:-1])
df["lon_bin"] = pd.cut(df["longitude"], lon_bins, labels=lon_bins[:-1])

grid = (
    df.groupby(["lat_bin", "lon_bin"])["so2"]
      .mean()
      .unstack()
      .sort_index(ascending=False)  # north on top
)

# convert to xarray DataArray
grid_da = xr.DataArray(
    grid.values,
    dims=("lat", "lon"),
    coords={
        "lat": grid.index.astype(float) + GRID_RES / 2,   # cell centre
        "lon": grid.columns.astype(float) + GRID_RES / 2,
    },
    name="SO2_column",
    attrs=so2.attrs,
)
grid_da.rio.write_crs("EPSG:4326", inplace=True)
grid_tif = f"so2_grid_{time_str.replace('-', '')}.tif"
grid_da.rio.to_raster(grid_tif, compress="LZW")
print(f"✓ Saved GeoTIFF → {grid_tif}")

print("✅ All done")
