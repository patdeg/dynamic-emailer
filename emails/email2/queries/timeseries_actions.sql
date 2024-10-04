SELECT
	acted_name AS category, 
	DATE(FROM_UNIXTIME(time)) AS action_date,
	COUNT(1) AS N 
FROM
	luckperms_actions 
WHERE 
	time >= UNIX_TIMESTAMP() - 604800
GROUP BY 1,2
