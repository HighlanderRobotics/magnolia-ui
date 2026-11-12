// Keep compatibility with Flutter 3.35 before the material_ui split.
// ignore: deprecated_member_use
import 'package:flutter/material.dart';
import 'package:magnolia_ui/magnolia_ui.dart';

void main() => runApp(
  MaterialApp(
    theme: MagnoliaTheme.light(),
    darkTheme: MagnoliaTheme.dark(),
    home: Scaffold(
      appBar: AppBar(title: const Text('Magnolia UI')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          FilledButton(onPressed: () {}, child: const Text('Continue')),
          const TextField(decoration: InputDecoration(labelText: 'Team name')),
        ],
      ),
    ),
  ),
);
