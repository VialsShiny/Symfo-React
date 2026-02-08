<?php

namespace App\Controller;

use App\Entity\Article;
use App\Service\StripeService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
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

        $productArray = $this->stripeService->getItemSession($data, Article::class);

        return $this->json($productArray);
    }
}
