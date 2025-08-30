<?php
/*
Plugin Name: SOVR Pay Gateway
Description: WooCommerce payment gateway for SOVR Pay Network Suite
Version: 0.1
Author: Stavo
*/
add_action('plugins_loaded', 'sovrpay_init', 11);
function sovrpay_init() {
    if (!class_exists('WC_Payment_Gateway')) return;
    class WC_Gateway_SOVRPay extends WC_Payment_Gateway {
        public function __construct() {
            $this->id = 'sovrpay';
            $this->method_title = 'SOVR Pay';
            $this->has_fields = false;
            $this->init_form_fields();
            $this->init_settings();
            add_action('woocommerce_receipt_' . $this->id, array($this, 'receipt_page'));
        }
        public function init_form_fields() {
            $this->form_fields = array(
                'api_url' => array(
                    'title' => 'API URL',
                    'type' => 'text',
                    'default' => 'http://localhost:8000',
                ),
            );
        }
        public function process_payment($order_id) {
            $order = wc_get_order($order_id);
            $api_url = $this->get_option('api_url');
            // Call your API to initiate payment here (simplified)
            wp_remote_post("$api_url/initiate_payment", array(
                'body' => json_encode(array(
                    'order_id' => $order_id,
                    'amount' => $order->get_total(),
                    'recipient' => $order->get_billing_email(),
                )),
                'headers' => array('Content-Type' => 'application/json'),
            ));
            return array(
                'result' => 'success',
                'redirect' => $order->get_checkout_payment_url(true),
            );
        }
        public function receipt_page($order) {
            echo '<p>Thank you for your order. Please complete payment via SOVR Pay.</p>';
        }
    }
    add_filter('woocommerce_payment_gateways', function($methods) {
        $methods[] = 'WC_Gateway_SOVRPay';
        return $methods;
    });
}
?>
