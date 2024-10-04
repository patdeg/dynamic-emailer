-- chart_data.sql
SELECT 
  cal_date,
  SUM(sales) AS N
 FROM
   bike_sales
 GROUP BY 1
 ORDER BY 1;
