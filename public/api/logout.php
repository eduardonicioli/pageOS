<?php
session_start();
session_destroy();
header("Location: /pageos/index.html");
exit;
