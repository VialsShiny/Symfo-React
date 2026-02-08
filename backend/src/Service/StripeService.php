<?php

namespace App\Service;

use Doctrine\ORM\EntityManagerInterface;
use Stripe\Checkout\Session;
use Stripe\Stripe;

final class StripeService
{
  private EntityManagerInterface $entityManagerInterface;

  public function __construct(
    EntityManagerInterface $entityManagerInterface
  ) {
    $this->entityManagerInterface = $entityManagerInterface;
  }

  private function createSession($lineItems)
  {
    Stripe::setApiKey($_ENV['STRIPE_SECRET_KEY']);

    $session = Session::create([
      'payment_method_types' => ['card', 'paypal'],
      'line_items' => $lineItems,
      'mode' => 'payment',
      'success_url' => 'http://localhost/success',
      'cancel_url' => 'http://localhost/cancel',

    ]);

    return $session->url;
  }

  private function createLineItems($items)
  {
    $lineItems = [];
    foreach ($items as $item) {
      $lineItems[] = [
        'price_data' => [
          'currency' => 'eur',
          'product_data' => [
            'name' => $item['data']->getTitle(),
            'description' => $item['data']->getContent(),
          ],
          'unit_amount' => $item['data']->getPrice() * 100, // Example : 43.24 -> 4324
        ],
        'quantity' => $item['qt'],
      ];
    }

    return $this->createSession($lineItems);
  }

  public function getItemSession($data, $entity)
  {
    $itemArray = [];
    foreach ($data as $el) {
      $item = $this->entityManagerInterface->getRepository($entity)->find($el['id']);
      $itemArray[] = ["data" => $item, "qt" => $el['qt']];
    }

    return $this->createLineItems($itemArray);
  }
}
