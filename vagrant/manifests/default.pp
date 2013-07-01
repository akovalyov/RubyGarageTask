
exec { 'apt-get update':
  command => 'apt-get update',
  path    => '/usr/bin/',
  timeout => 60,
  tries   => 3,
}

class { 'apt':
  always_apt_update => true,
}

package { ['python-software-properties']:
  ensure  => 'installed',
  require => Exec['apt-get update'],
}

file { '/home/vagrant/.bash_aliases':
  ensure => 'present',
  source => 'puppet:///modules/puphpet/dot/.bash_aliases',
}

package { ['build-essential', 'vim', 'curl']:
  ensure  => 'installed',
  require => Exec['apt-get update'],
}

include nginx

    
nginx::resource::vhost { 'awesome.dev':
  ensure       => present,
  server_name  => ['awesome.dev'],
  listen_port  => 80,
  index_files  => ['index.html', 'index.htm', 'index.php', 'app.php', 'app_dev.php'],
  www_root     => '/var/www/web',
  try_files    => ['$uri', '$uri/', '/app_dev.php?$args'],
}

nginx::resource::location { "awesome.dev-php":
  ensure              => 'present',
  vhost               => 'awesome.dev',
  location            => '~ \.php$',
  proxy               => undef,
  try_files           => ['$uri', '$uri/', '/app_dev.php?$args'],
  www_root            => '/var/www/web',
  location_cfg_append => {
    'fastcgi_split_path_info' => '^(.+\.php)(/.+)$',
    'fastcgi_param'           => 'PATH_INFO $fastcgi_path_info',
    'fastcgi_param '          => 'PATH_TRANSLATED $document_root$fastcgi_path_info',
    'fastcgi_param  '         => 'SCRIPT_FILENAME $document_root$fastcgi_script_name',
    '#1#if you encounter problems connecting to the socket try the cgi way' => '',
    '#2#fastcgi_pass'           => '127.0.0.1:9000',
    'fastcgi_pass'            => 'unix:/var/run/php5-fpm.sock',
    'fastcgi_index'           => 'index.php',
    'include'                 => 'fastcgi_params'
  },
  notify              => Class['nginx::service'],
}

apt::ppa { 'ppa:ondrej/php5-experimental':
  before  => Class['php'],
}

class { 'php':
  package             => 'php5',
  service             => 'php5-fpm',
  service_autorestart => false,
}

php::module {
  [
    'php5-mysql',
    'php5-fpm',
    'php5-cli',
    'php5-curl',
    'php5-intl',
    'php5-mcrypt',
  ]:
  service => 'php5-fpm',
}

service { 'php5-fpm':
  ensure     => running,
  enable     => true,
  hasrestart => true,
  hasstatus  => true,
  require    => Package['php5-fpm'],
}

class { 'php::devel':
  require => Class['php'],
}

class { 'php::pear':
  require => Class['php'],
}



class { 'xdebug':
  service => 'nginx',
}

xdebug::config { 'cgi':
  remote_autostart => '0',
  remote_port      => '9001',
}
xdebug::config { 'cli':
  remote_autostart => '0',
  remote_port      => '9001',
}

php::pecl::module { 'xhprof':
  use_package => false,
}

nginx::resource::vhost { 'xhprof':
  ensure      => present,
  server_name => ['xhprof'],
  listen_port => 80,
  index_files => ['index.php'],
  www_root    => '/var/www/xhprof/xhprof_html',
  try_files   => ['$uri', '$uri/', '/index.php?$args'],
  require     => Php::Pecl::Module['xhprof']
}


class { 'php::composer': }

php::ini { 'php':
  value   => ['date.timezone = "Europe/Kiev"'],
  target  => 'php.ini',
  service => 'php5-fpm',
}
php::ini { 'custom':
  value   => ['display_errors = On', 'error_reporting = -1'],
  target  => 'custom.ini',
  service => 'php5-fpm',
}

class { 'mysql':
  root_password => 'root',
  require       => Exec['apt-get update'],
}

mysql::grant { 'rubygarage':
  mysql_privileges     => 'ALL',
  mysql_db             => 'rubygarage',
  mysql_user           => 'user',
  mysql_password       => 'user',
  mysql_host           => 'localhost',
  mysql_grant_filepath => '/home/vagrant/puppet-mysql',
}

class { 'phpmyadmin':
  require => Class['mysql'],
}

nginx::resource::vhost { 'phpmyadmin':
  ensure      => present,
  server_name => ['phpmyadmin'],
  listen_port => 80,
  index_files => ['index.php'],
  www_root    => '/usr/share/phpmyadmin',
  try_files   => ['$uri', '$uri/', '/index.php?$args'],
  require     => Class['phpmyadmin'],
}

nginx::resource::location { "phpmyadmin-php":
  ensure              => 'present',
  vhost               => 'phpmyadmin',
  location            => '~ \.php$',
  proxy               => undef,
  try_files           => ['$uri', '$uri/', '/index.php?$args'],
  www_root            => '/usr/share/phpmyadmin',
  location_cfg_append => {
    'fastcgi_split_path_info' => '^(.+\.php)(/.+)$',
    'fastcgi_param'           => 'PATH_INFO $fastcgi_path_info',
    'fastcgi_param '          => 'PATH_TRANSLATED $document_root$fastcgi_path_info',
    'fastcgi_param  '         => 'SCRIPT_FILENAME $document_root$fastcgi_script_name',
    'fastcgi_pass'            => 'unix:/var/run/php5-fpm.sock',
    'fastcgi_index'           => 'index.php',
    'include'                 => 'fastcgi_params'
  },
  notify              => Class['nginx::service'],
  require             => Nginx::Resource::Vhost['phpmyadmin'],
}

