# Run apt-get update to create the stamp file.
execute "apt-get-update" do
  command "apt-get update"
  ignore_failure true
  not_if do ::File.exists?('/var/lib/apt/periodic/update-success-stamp') end
end

# For other recipes to call to force an update.
execute "apt-get update" do
  command "apt-get update"
  ignore_failure true
  action :nothing
end

# Provides /var/lib/apt/periodic/update-success-stamp on apt-get update.
package "update-notifier-common" do
  notifies :run, resources(:execute => "apt-get-update"), :immediately
end

execute "apt-get-update-periodic" do
  command "apt-get update"
  ignore_failure true
  only_if do
    File.exists?('/var/lib/apt/periodic/update-success-stamp') &&
    File.mtime('/var/lib/apt/periodic/update-success-stamp') < Time.now - 86400
  end
end

# Install the software we need.
%w(
curl
apache2
libapache2-mod-php5
git
php5-cli
php5-curl
php5-gd
php5-sqlite
php5-mysql
mysql-server
php5-intl
php-apc

).each { | pkg | package pkg }

template "/etc/apache2/sites-enabled/vhost.conf" do
  user "root"
  mode "0644"
  source "vhost.conf.erb"
  notifies :reload, "service[apache2]"
end

service "apache2" do
  supports :restart => true, :reload => true, :status => true
  action [ :enable, :start ]
end

execute "check if short_open_tag is Off in /etc/php5/apache2/php.ini?" do
  user "root"
  not_if "grep 'short_open_tag = Off' /etc/php5/apache2/php.ini"
  command "sed -i 's/short_open_tag = On/short_open_tag = Off/g' /etc/php5/apache2/php.ini"
end

execute "check if short_open_tag is Off in /etc/php5/cli/php.ini?" do
  user "root"
  not_if "grep 'short_open_tag = Off' /etc/php5/cli/php.ini"
  command "sed -i 's/short_open_tag = On/short_open_tag = Off/g' /etc/php5/cli/php.ini"
end

execute "check if date.timezone is UTC in /etc/php5/apache2/php.ini?" do
  user "root"
  not_if "grep '^date.timezone = UTC' /etc/php5/apache2/php.ini"
  command "sed -i 's/;date.timezone =.*/date.timezone = UTC/g' /etc/php5/apache2/php.ini"
end

execute "check if date.timezone is UTC in /etc/php5/cli/php.ini?" do
  user "root"
  not_if "grep '^date.timezone = UTC' /etc/php5/cli/php.ini"
  command "sed -i 's/;date.timezone =.*/date.timezone = UTC/g' /etc/php5/cli/php.ini"
end

bash "Running composer install and preparing the vendors repository" do
  not_if "test -e /mnt/RubyGarageTask/vendor/symfony/symfony/src/Symfony/Bundle/FrameworkBundle/Resources/public"
  user "vagrant"
  cwd "/mnt/RubyGarageTask"
  code <<-EOH
    set -e
    curl -s https://getcomposer.org/installer | php
    COMPOSER_VENDOR_DIR="/mnt/RubyGarageTask/vendor" php composer.phar install --dev --prefer-dist
  EOH
end

execute  "Create database" do
  cwd "/mnt/RubyGarageTask"
  command "whoami && php app/console doctrine:database:create --no-debug && php app/console doctrine:schema:create --no-debug && php app/console fos:user:create testuser test@test.com securepassword"
  ignore_failure true
  action :run

end