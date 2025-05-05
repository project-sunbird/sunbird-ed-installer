#!/bin/bash
set -euo pipefail

echo "Install packages"
apt update && apt-get install -y wget unzip

echo "Download maxmind_custom_data_mapping.csv file"
wget -O maxmind_custom_data_mapping.csv https://{{ .Values.global.object_storage_endpoint }}/{{ .Values.global.public_container_name }}/public/maxmind_custom_data_mapping.csv

echo "Download Maxmind GeoCity database"
wget "https://{{.Values.global.object_storage_endpoint }}/{{ .Values.global.public_container_name }}/artifacts-{{.Values.global.release_version}}/{{.Values.maxmind_db_zip_filename}}"

echo "Unarchive Maxmind GeoCity database"
unzip {{ .Values.maxmind_db_dir_name }}.zip

echo "Download Maxmind GeoIP2 CSV Converter Program v1.0.0"
wget {{ .Values.maxmind_geoip2_csv_converter_url }}

echo "Unarchive Maxmind GeoIP2 CSV Converter"
tar -xf {{ .Values.maxmind_db_converter_archive_filename }}

echo "Convert IPV4 CSV database to IP Range database"
./geoip2-csv-converter-v1.0.0/geoip2-csv-converter -block-file={{ .Values.maxmind_db_dir_name }}/{{ .Values.maxmind_db_geo_city_blocks_filename }} -output-file={{ .Values.maxmind_db_dir_name }}/{{ .Values.maxmind_db_geo_city_ip_range_filename }} -include-integer-range

echo "Create schema of geolocation db update from template file"
psql -U {{ .Values.global.postgresql.postgresqlUsername }} -d {{ .Values.geo_location_db }} -h {{ .Values.global.postgresql.host }} -f /config/geo-location-schema.sql