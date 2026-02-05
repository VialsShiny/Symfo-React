<?php

namespace App\Controller;

use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Exception;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Serializer\SerializerInterface;
use Symfony\Component\Validator\Validator\ValidatorInterface;

final class UserController extends AbstractController
{
    protected EntityManagerInterface $entityManagerInterface;
    protected SerializerInterface $serializerInterface;

    public function __construct(
        EntityManagerInterface $entityManager,
        SerializerInterface $serializer
    ) {
        $this->entityManagerInterface = $entityManager;
        $this->serializerInterface = $serializer;
    }

    #[Route('/users', name: 'All Users', methods: ["GET"])]
    public function index()
    {
        $users = $this->entityManagerInterface
            ->getRepository(User::class)
            ->findAll();

        $data = $this->serializerInterface->serialize(
            $users,
            'json',
            ['groups' => ['user:read']]
        );

        return new JsonResponse($data, 200, [], true);
    }

    #[Route('/users/{id}', name: 'Find User by ID', methods: ["GET"])]
    public function details(int $id)
    {
        $user = $this->entityManagerInterface
            ->getRepository(User::class)
            ->find($id);

        if (!$user) {
            return new JsonResponse(["message" => "Utilisateur Invalide.", "status" => 404], 404);
        }

        $data = $this->serializerInterface->serialize(
            $user,
            'json',
            ['groups' => ['user:read']]
        );

        return new JsonResponse($data, 200, [], true);
    }

    #[Route('/users/{id}', name: 'Delete User by ID', methods: ["DELETE"])]
    public function delete(int $id)
    {
        $user = $this->entityManagerInterface
            ->getRepository(User::class)
            ->find($id);

        if (!$user) {
            return new JsonResponse(["message" => "Utilisateur Introuvable.", "status" => 404], 404);
        }

        try {
            $this->entityManagerInterface->remove($user);
            $this->entityManagerInterface->flush();
        } catch (Exception $e) {
            return new JsonResponse(["message" => "Une erreur s'est produite : $e", "status" => 500], 500);
        }

        return new JsonResponse(["message" => "Utiliseur bien supprimé.", "status" => 200], 200);
    }

    #[Route('/users', name: 'user_create', methods: ['POST'])]
    public function create(Request $request, ValidatorInterface $validator): JsonResponse
    {
        $data = $request->toArray();

        $user = new User();
        $user->setEmail($data['email'] ?? '');
        $user->setPassword($data['password'] ?? '');

        $errors = $validator->validate($user);

        if (count($errors) > 0) {
            $messages = [];

            foreach ($errors as $error) {
                $messages[$error->getPropertyPath()][] = $error->getMessage();
            }

            return new JsonResponse([
                'success' => false,
                'errors' => $messages
            ], 422);
        }

        try {
            $this->entityManagerInterface->persist($user);
            $this->entityManagerInterface->flush();
        } catch (Exception $e) {
            return new JsonResponse([
                'success' => false,
                'message' => 'Erreur serveur'
            ], 500);
        }

        return new JsonResponse([
            'success' => true,
            'data' => [
                'id' => $user->getId(),
                'email' => $user->getEmail(),
                'roles' => $user->getRoles()
            ]
        ], 201);
    }
}