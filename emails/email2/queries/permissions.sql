select 
	username, 
	primary_group, 
	permission, 
	value, 
	server, 
	world 
FROM
	luckperms_user_permissions AS P 
	INNER JOIN luckperms_players AS U ON U.uuid=P.uuid 
ORDER BY 1,2,3;
