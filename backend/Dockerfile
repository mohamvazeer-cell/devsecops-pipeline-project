FROM php:8.2-apache

ENV APACHE_DOCUMENT_ROOT /var/www/html/public

RUN a2enmod rewrite \
    && sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/sites-available/*.conf /etc/apache2/apache2.conf /etc/apache2/conf-available/*.conf

COPY . /var/www/html/

RUN mkdir -p /var/www/html/data \
    && touch /var/www/html/data/tasks.json \
    && chown -R www-data:www-data /var/www/html/data \
    && chmod -R 775 /var/www/html/data

EXPOSE 80