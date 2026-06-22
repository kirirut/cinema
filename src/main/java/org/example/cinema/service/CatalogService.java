package org.example.cinema.service;

import org.example.cinema.dto.CatalogResponse;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CatalogService {

    private final GenreService genreService;
    private final CountryService countryService;
    private final TagService tagService;
    private final RoleService roleService;

    public CatalogService(
            GenreService genreService,
            CountryService countryService,
            TagService tagService,
            RoleService roleService
    ) {
        this.genreService = genreService;
        this.countryService = countryService;
        this.tagService = tagService;
        this.roleService = roleService;
    }

    @Transactional(readOnly = true)
    public CatalogResponse getCatalog() {
        return new CatalogResponse(
                genreService.findAll(),
                countryService.findAll(),
                tagService.findAll(),
                roleService.findAll()
        );
    }
}
