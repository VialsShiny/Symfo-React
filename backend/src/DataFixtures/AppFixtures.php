<?php

namespace App\DataFixtures;

use App\Entity\User;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Persistence\ObjectManager;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

class AppFixtures extends Fixture
{
    private UserPasswordHasherInterface $passwordHasher;

    public function __construct(UserPasswordHasherInterface $passwordHasher)
    {
        $this->passwordHasher = $passwordHasher;
    }

    public function load(ObjectManager $manager): void
    {
        $usersData = [
            [
                'id' => 1,
                'email' => 'admin@test.com',
                'roles' => ['ROLE_ADMIN'],
                'plainPassword' => 'admin',
            ],
            [
                'id' => 2,
                'email' => 'user@test.com',
                'roles' => ['ROLE_USER'],
                'plainPassword' => 'user',
            ],
            [
                'id' => 3,
                'email' => 'alice@example.com',
                'roles' => ['ROLE_USER'],
                'plainPassword' => 'alice123',
            ],
        ];

        foreach ($usersData as $data) {
            $user = new User();
            $user->setId($data['id']);
            $user->setEmail($data['email']);
            $user->setRoles($data['roles']);

            $hashedPassword = $this->passwordHasher->hashPassword($user, $data['plainPassword']);
            $user->setPassword($hashedPassword);

            $manager->persist($user);
        }

        $manager->flush();
    }
}
