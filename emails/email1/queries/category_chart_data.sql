-- category_chart_data.sql
SELECT
  bike_type,
  COUNT(1) AS N
 FROM `bigquery-public-data.austin_bikeshare.bikeshare_trips`
 WHERE
  start_time>='2024-06-01 00:00:00'
GROUP BY 1
ORDER BY 2 DESC


