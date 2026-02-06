<?php

namespace App\Controller;

use App\Entity\Article;
use Doctrine\ORM\EntityManagerInterface;
use Doctrine\ORM\Query\Expr\Func;
use Stripe\Checkout\Session;
use Stripe\Stripe;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

final class StripeController extends AbstractController
{
    protected EntityManagerInterface $entityManagerInterface;

    public function __construct(
        EntityManagerInterface $entityManagerInterface
    ) {
        $this->entityManagerInterface = $entityManagerInterface;
    }

    private function handleStripe($products)
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

    #[Route('/stripe/pay', name: 'app_stripe_pay', methods: ["POST"])]
    public function index(Request $request)
    {
        $productArray = [];
        $requestArray = $request->toArray();
        $data = $requestArray['cardProducts'];
        foreach ($data as $el) {
            $product = $this->entityManagerInterface->getRepository(Article::class)->find($el['id']);
            $productArray[] = ["data" => $product];
        }

        $lineItems = [];
        foreach ($productArray as $product) {
            $lineItems[] = [
                'price_data' => [
                    'currency' => 'eur',
                    'product_data' => [
                        'name' => $product['data']->getTitle(),
                        'description' => $product['data']->getContent(),
                    ],
                    'unit_amount' => $product['data']->get
                ],
                'quantity' => 1,
            ];
        }

        return $this->json($productArray);
    }
}
