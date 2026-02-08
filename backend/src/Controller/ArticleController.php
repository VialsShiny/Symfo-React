<?php

namespace App\Controller;

use App\Entity\Article;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Serializer\SerializerInterface;

final class ArticleController extends AbstractController
{

    private EntityManagerInterface $entityManagerInterface;
    private SerializerInterface $serializerInterface;

    public function __construct(
        EntityManagerInterface $entityManagerInterface,
        SerializerInterface $serializerInterface
    ) {
        $this->entityManagerInterface = $entityManagerInterface;
        $this->serializerInterface = $serializerInterface;
    }

    #[Route('/articles', name: 'app_article')]
    public function index(): JsonResponse
    {
        $articles = $this->entityManagerInterface->getRepository(Article::class)->findAll();

        $data = $this->serializerInterface->serialize(
            $articles,
            'json',
            ['groups' => ['user:read']]
        );

        return new JsonResponse($data, 200, [], true);
    }
}
