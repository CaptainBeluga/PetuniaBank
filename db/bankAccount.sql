PGDMP                      }           bankaccount    17.5    17.5     �           0    0    ENCODING    ENCODING        SET client_encoding = 'UTF8';
                           false            �           0    0 
   STDSTRINGS 
   STDSTRINGS     (   SET standard_conforming_strings = 'on';
                           false            �           0    0 
   SEARCHPATH 
   SEARCHPATH     8   SELECT pg_catalog.set_config('search_path', '', false);
                           false            �           1262    16388    bankaccount    DATABASE     ~   CREATE DATABASE bankaccount WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE_PROVIDER = libc LOCALE = 'Italian_Italy.1252';
    DROP DATABASE bankaccount;
                     postgres    false            �            1259    16397    transactions    TABLE     �   CREATE TABLE public.transactions (
    transaction_id integer NOT NULL,
    oauth_sub text,
    amount double precision,
    actiontype text,
    actiondate text
);
     DROP TABLE public.transactions;
       public         heap r       postgres    false            �            1259    16404    transactions_transactionID_seq    SEQUENCE     �   ALTER TABLE public.transactions ALTER COLUMN transaction_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public."transactions_transactionID_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);
            public               postgres    false    217            �            1259    24587    users    TABLE     s   CREATE TABLE public.users (
    oauth_sub text NOT NULL,
    nickname text NOT NULL,
    role text DEFAULT USER
);
    DROP TABLE public.users;
       public         heap r       postgres    false            �          0    16397    transactions 
   TABLE DATA           a   COPY public.transactions (transaction_id, oauth_sub, amount, actiontype, actiondate) FROM stdin;
    public               postgres    false    217   �       �          0    24587    users 
   TABLE DATA           :   COPY public.users (oauth_sub, nickname, role) FROM stdin;
    public               postgres    false    219   b       �           0    0    transactions_transactionID_seq    SEQUENCE SET     P   SELECT pg_catalog.setval('public."transactions_transactionID_seq"', 180, true);
          public               postgres    false    218            '           2606    16406    transactions transactions_pkey 
   CONSTRAINT     h   ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_pkey PRIMARY KEY (transaction_id);
 H   ALTER TABLE ONLY public.transactions DROP CONSTRAINT transactions_pkey;
       public                 postgres    false    217            )           2606    24593    users users_pkey 
   CONSTRAINT     _   ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (oauth_sub, nickname);
 :   ALTER TABLE ONLY public.users DROP CONSTRAINT users_pkey;
       public                 postgres    false    219    219            �   �   x���K�0�ur����N��&j�*�����TG�i��8"C)R/�ak�����ҋ� ����n��4{�h�n�t�ߜ}���U�3�ct��3	�RqaB꼤�$�Ǳ�*��������&p�,�,���ћ����p~�D�=8���嗤�A�I�gm��M��f=��      �   e   x�-�I�0 ��cP�x{7�%T���P��\FÊZs8a┡�-������	�(�U�/���$��:_[̿~���!_z�n�}���� | ��!a     