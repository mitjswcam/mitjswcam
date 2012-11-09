<?php require_once('php/util.php'); ?>
<!DOCTYPE html>
<html>
  <head>
    <?php
      $title = getenv('WEB_CAM_TITLE');
      printf("<title>%s</title>", $title);
      $description = getenv('WEB_CAM_DESC');
      printf('<meta name="description" content="%s" />', dq_escape($description));
    ?>
    <link rel="stylesheet" type="text/css" href="static/css/styles.css"></link>
    <link rel="stylesheet/less" type="text/css" href="bootstrap/less/bootstrap.less"></link>
    <script src="static/js/less-1.3.0.min.js" type="text/javascript"></script>
    <script src="//ajax.googleapis.com/ajax/libs/jquery/1.8.1/jquery.min.js"></script> 
    <script src="static/js/bootstrap.min.js" type="text/javascript"></script>
    <script src="bootbox/bootbox.min.js" type="text/javascript"></script>
    <script src="index.js" type="text/javascript"></script>
    <script type="text/javascript">
      <?php 
	printf("var userId = '%s';", uuid());
	$experiments = load_experiments();
	printf("var experiments = %s;", json_encode($experiments));
	load_fragments(get_default_fragments());
      ?>
    </script>
  </head>
  
  <body>
    <!-- Top Navbarr -->
    <div class="navbar navbar-fixed-top">
      <div class="navbar-inner">
	<div class="container-fluid">
	  <a class="btn btn-navbar" data-toggle="collapse" data-target=".nav-collapse">
	    <span class="icon-bar"></span>
	    <span class="icon-bar"></span>
	    <span class="icon-bar"></span>
	  </a>
	  <a class="brand"><?php echo $title; ?></a>
	  <div class="nav-collapse collapse">
	    <ul class="nav">
	      <li class="home active"><a href="#" onclick="page.show('home')">Home</a></li>
	      <li class="about"><a href="#" onclick="page.show('about')">About</a></li>
	      <li class="contact"><a href="#" onclick="page.show('contact')">Contact</a></li>
	    </ul>
	  </div>
	</div><!--./container-fluid-->
      </div><!--./navbar-inner-->
    </div><!--./navbar-->

    <!--Page Content -->
    <div id="page-container" class="container-fluid skip-fixed-sidebar">
      <div class="row-fluid">
	<div class="span12 content_pane">
	    
	</div>	
      </div><!--/ .row-fluid-->
    </div><!--/ #page-container .container-fluid .skip-fixed-sidebar-->

    
    <!-- Sidebar -->
    <div id="menu-container">
      <div id="menu" class="well sidebar-nav-fixed">
	<!-- INSERT APPLET HERE -->
	<div id="jswcam"></div>
	<ul class="nav nav-list">
	  <li class="nav-header">Directions</li>
	  <li>Lorem Ipsum Dolor Summit Est</li>
	  <!--<li class="nav-header">HEADER</li>
	  <li class="active"><a href="#">LINK</a></li>
	  <li><a href="#">LINK</a></li>-->
	</ul>
	<div id="temp"></div>
      </div><!--/ #menu, .well, .sidebar-nav-fixed-->
    </div><!--/ #menu-container-->
  </body>
</html>
