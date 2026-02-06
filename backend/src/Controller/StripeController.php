<?php

namespace App\Controller;

use Stripe\Checkout\Session;
use Stripe\Stripe;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\Routing\Attribute\Route;

final class StripeController extends AbstractController
{
    #[Route('/stripe/pay', name: 'app_stripe_pay', methods: ["GET"])]
    public function pay()
    {
        Stripe::setApiKey($_ENV['STRIPE_SECRET_KEY']);

        $session = Session::create([
            'payment_method_types' => ['card', 'paypal'],

            'line_items' => [
                [
                    'price_data' => [
                        'currency' => 'eur',
                        'product_data' => [
                            'name' => 'Produit Test',
                        ],
                        'unit_amount' => 1000, // Montant en centimes (10€)
                    ],
                    'quantity' => 1,
                ],
            ],

            'mode' => 'payment',
            'success_url' => 'http://localhost/success',
            'cancel_url' => 'http://localhost/cancel',

        ]);


        // Redirigez l'utilisateur vers la page de paiement
        return $this->json($session->url);

    }
}
