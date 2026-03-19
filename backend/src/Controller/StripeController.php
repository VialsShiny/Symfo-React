<?php

namespace App\Controller;

use App\Entity\Article;
use App\Service\StripeService;
use Stripe\Checkout\Session;
use Stripe\Exception\ApiErrorException;
use Stripe\Stripe;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

final class StripeController extends AbstractController
{
    private StripeService $stripeService;

    public function __construct(
        StripeService $stripeService
    ) {
        $this->stripeService = $stripeService;
    }

    #[Route('/stripe/pay', name: 'app_stripe_pay', methods: ["POST"])]
    public function index(Request $request)
    {
        $requestArray = $request->toArray();
        $data = $requestArray['cartProducts'];

        $productArray = $this->stripeService->getItemSession($data, Article::class, $requestArray['uri']);

        return $this->json($productArray);
    }

    #[Route('/stripe/verify-payment', name: 'app_stripe_verify_payment', methods: ['GET'])]
    public function verifyPayment(Request $request): JsonResponse
    {
        Stripe::setApiKey($_ENV['STRIPE_SECRET_KEY']);

        $sessionId = $request->query->get('session_id');

        if (!$sessionId) {
            return $this->json(['error' => 'Missing session_id'], 400);
        }

        try {
            $session = Session::retrieve($sessionId);

            if ($session->payment_status === 'paid' && $session->mode === 'payment') {
                return new JsonResponse([
                    'paid' => true,
                    'customer_email' => $session->customer_details->email ?? null,
                    'amount_total' => $session->amount_total,
                    'currency' => $session->currency,
                ]);
            }

            return $this->json(['paid' => false]);

        } catch (ApiErrorException $e) {
            return $this->json([
                'error' => 'Stripe error: ' . $e->getMessage()
            ], 500);
        }
    }
}
