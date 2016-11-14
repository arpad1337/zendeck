<?php

print_r($_POST);

if(!empty($_POST['email'])) {
	file_put_contents('../../../protected/emails.zendeck', $_POST['email'] . "\n", LOCK_EX | FILE_APPEND);
	header('location:index.html#success');
}
