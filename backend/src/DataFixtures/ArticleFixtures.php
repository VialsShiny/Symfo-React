<?php

namespace App\DataFixtures;

use App\Entity\Article;
use DateTime;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Persistence\ObjectManager;

class ArticleFixtures extends Fixture
{
    public function load(ObjectManager $manager): void
    {
        for ($i = 1; $i <= 10; $i++) {
            $article = new Article();

            $article->setId($i);
            $article->setTitle("Article numéro $i");
            $article->setContent("Contenu de l'article $i. Lorem ipsum dolor sit amet.");
            $article->setPrice(mt_rand(1000, 5000) / 100);
            $article->setPublishedAt(new DateTime());
            $article->setIsPublished(true);

            $manager->persist($article);
        }

        $manager->flush();
    }
}
