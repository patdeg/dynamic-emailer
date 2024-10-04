-- category_chart_data.sql
SELECT
	acted_name AS category, 
	COUNT(1) AS N 
FROM
	luckperms_actions 
GROUP BY 1
ORDER BY 2 DESC;
