-- template.sql
SELECT 
  CAST(start_time AS DATE) AS CAL_DATE,
  COUNT(1) AS N
 FROM bigquery-public-data.austin_bikeshare.bikeshare_trips 
 WHERE
  start_time>='2024-06-20 00:00:00'
 GROUP BY 1
 ORDER BY 1 DESC

