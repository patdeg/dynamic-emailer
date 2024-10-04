SELECT
	acted_name AS category, 
	COUNT(1) AS N 
FROM
	luckperms_actions 
WHERE 
	time >= UNIX_TIMESTAMP() - 604800
GROUP BY 1
ORDER BY 2 DESC;
